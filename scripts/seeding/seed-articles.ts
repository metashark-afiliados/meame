// RUTA: scripts/seeding/seed-articles.ts
/**
 * @file seed-articles.ts
 * @description Script de siembra para CogniRead.
 * @version 7.0.0 (Definitive, Two-Step Upsert & Radiography Logging)
 * @author RaZ Podestá
 */
import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";
import { logger } from "../../src/shared/lib/logging";
import {
  CogniReadArticleSchema,
  type CogniReadArticle,
} from "../../src/shared/lib/schemas/cogniread/article.schema";
import { loadEnvironment } from "../../scripts/diagnostics/_utils";
import { createScriptClient } from "../../src/shared/lib/supabase/script-client";

async function seedSingleCogniReadArticle() {
  const traceId = logger.startTrace("seedCogniReadArticle_v7.0_Definitive");
  logger.startGroup("🌱 Iniciando siembra de artículo de CogniRead...");
  loadEnvironment(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);

  const fixturePathArgument = process.argv[3];
  if (!fixturePathArgument) {
    logger.error(
      "❌ Error Crítico: No se especificó la ruta al archivo de fixture."
    );
    process.exit(1);
  }
  const fixturePath = path.resolve(process.cwd(), fixturePathArgument);

  try {
    const fileContent = await fs.readFile(fixturePath, "utf-8");
    const articleData: CogniReadArticle = JSON.parse(fileContent);

    const validation = CogniReadArticleSchema.safeParse(articleData);
    if (!validation.success) {
      logger.error("[Seeder] El archivo de fixture es inválido.", {
        errors: validation.error.flatten(),
        traceId,
      });
      throw new Error("Los datos del fixture son inválidos.");
    }

    const validatedData = validation.data;
    logger.info(
      `   Procesando fixture validado: ${path.basename(fixturePath)}`
    );

    logger.startGroup("[Radiografía Detallada]");
    logger.info("Datos validados desde Zod:", validatedData);

    const supabase = createScriptClient();

    // --- ARQUITECTURA DE PERSISTENCIA DEFINITIVA EN DOS PASOS ---

    // PASO 1: Cargar datos primarios (escalares y JSONB)
    const primaryPayload = {
      id: validatedData.articleId,
      status: validatedData.status,
      study_dna: validatedData.studyDna,
      content: validatedData.content,
      bavi_hero_image_id: validatedData.baviHeroImageId || null,
      created_at: validatedData.createdAt,
      updated_at: validatedData.updatedAt,
    };

    logger.info("Enviando Payload PRIMARIO para UPSERT...", primaryPayload);

    const { data: upsertData, error: upsertError } = await supabase
      .from("cogniread_articles")
      .upsert(primaryPayload, { onConflict: "id" })
      .select("id")
      .single();

    if (upsertError) {
      logger.error("[Radiografía] FALLO en el UPSERT de datos primarios.", {
        error: upsertError,
      });
      throw new Error(`Paso 1 fallido: ${upsertError.message}`);
    }
    logger.success(
      `[Radiografía] ÉXITO en Paso 1: Upsert para ID '${upsertData.id}' completado.`
    );

    // PASO 2: Actualizar los campos de array de forma separada
    const arrayPayload = {
      tags: validatedData.tags || [],
      related_prompt_ids: validatedData.relatedPromptIds || [],
    };

    logger.info("Enviando Payload de ARRAYS para UPDATE...", arrayPayload);

    const { error: updateError } = await supabase
      .from("cogniread_articles")
      .update(arrayPayload)
      .eq("id", validatedData.articleId);

    if (updateError) {
      logger.error("[Radiografía] FALLO en el UPDATE de datos de array.", {
        error: updateError,
      });
      throw new Error(`Paso 2 fallido: ${updateError.message}`);
    }
    logger.success(
      `[Radiografía] ÉXITO en Paso 2: Update de arrays para ID '${validatedData.articleId}' completado.`
    );

    logger.endGroup(); // Fin de la Radiografía

    console.log(
      chalk.green.bold(
        `\n     ✅ Éxito Definitivo: Artículo '${validatedData.articleId}' sembrado/actualizado.`
      )
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("Error crítico durante el proceso de siembra:", {
      error: errorMessage,
      traceId,
    });
    logger.endGroup(); // Asegurarse de cerrar el grupo de radiografía en caso de error
    process.exit(1);
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}

seedSingleCogniReadArticle().then(() => {
  logger.success("✨ Proceso de siembra de artículo completado.");
  process.exit(0);
});
