// RUTA: scripts/seeding/seed-articles.ts
/**
 * @file seed-articles.ts
 * @description Script de siembra para CogniRead.
 * @version 8.0.0 (Isomorphic Action Compliance & Build Integrity Restoration)
 * @author L.I.A. Legacy
 */
import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";
import { logger } from "../../src/shared/lib/logging";
import { createOrUpdateArticleAction } from "../../src/shared/lib/actions/cogniread";
import {
  type CogniReadArticle,
} from "../../src/shared/lib/schemas/cogniread/article.schema";
import { createScriptClient } from "../../src/shared/lib/supabase/script-client";

async function seedSingleCogniReadArticle() {
  const traceId = logger.startTrace("seedCogniReadArticle_v8.0");
  logger.startGroup("🌱 Iniciando siembra de artículo de CogniRead...");

  const fixturePathArgument = process.argv[2];
  if (!fixturePathArgument) {
    logger.error(
      "❌ Error Crítico: No se especificó la ruta al archivo de fixture."
    );
    process.exit(1);
  }
  const fixturePath = path.resolve(process.cwd(), fixturePathArgument);

  try {
    const fileContent = await fs.readFile(fixturePath, "utf-8");
    const articleData: Partial<CogniReadArticle> = JSON.parse(fileContent);

    // --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: INYECCIÓN DE DEPENDENCIA] ---
    // 1. Se crea un cliente de Supabase compatible con el entorno de script.
    const scriptSupabaseClient = createScriptClient();
    // --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

    // 2. Se invoca la Server Action, pasando el cliente como un override.
    // Esto evita que la acción intente usar el cliente de Server Component.
    const result = await createOrUpdateArticleAction(
      articleData,
      scriptSupabaseClient
    );

    if (result.success) {
      console.log(
        chalk.green.bold(
          `\n     ✅ Éxito: Artículo '${result.data.articleId}' sembrado/actualizado en Supabase.`
        )
      );
    } else {
      console.error(
        chalk.red.bold(
          `     🔥 Fallo al sembrar '${path.basename(fixturePath)}':`
        ),
        result.error
      );
      process.exit(1);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("Error crítico durante el proceso de siembra:", {
      error: errorMessage,
      traceId,
    });
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
