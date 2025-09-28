// RUTA: scripts/seeding/seed-cogniread-article.ts
/**
 * @file seed-cogniread-article.ts
 * @description Script de siembra para insertar un artículo de CogniRead en Supabase.
 * @version 1.3.0 (Fix Definitivo de Resolución de Módulos con Alias Absolutos)
 * @author RaZ Podestá - MetaShark Tech
 * @usage pnpm tsx scripts/run-with-env.ts scripts/seeding/seed-cogniread-article.ts <path/to/fixture.json>
 */
import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";
// --- [INICIO DE CORRECCIÓN DEFINITIVA DE RUTAS DE IMPORTACIÓN (ALIAS ABSOLUTOS)] ---
import { logger } from "../../src/shared/lib/logging";
import { createOrUpdateArticleAction } from "../../src/shared/lib/actions/cogniread/createOrUpdateArticle.action";
import type { CogniReadArticle } from "../../src/shared/lib/schemas/cogniread/article.schema";
import { loadEnvironment } from "../diagnostics/_utils";
// --- [FIN DE CORRECCIÓN DEFINITIVA DE RUTAS DE IMPORTACIÓN] ---

async function seedSingleCogniReadArticle() {
  logger.startGroup(
    "🌱 Iniciando siembra de artículo de CogniRead en Supabase..."
  );
  loadEnvironment(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]); // Pasar las claves requeridas

  const fixturePathArgument = process.argv[3]; // El tercer argumento es la ruta al fixture

  if (!fixturePathArgument) {
    logger.error(
      "❌ Error: No se especificó la ruta al archivo de fixture del artículo."
    );
    logger.error(
      "   Uso: pnpm tsx scripts/run-with-env.ts scripts/seeding/seed-cogniread-article.ts <path/to/fixture.json>"
    );
    process.exit(1);
  }

  const fixturePath = path.resolve(process.cwd(), fixturePathArgument);

  try {
    const fileContent = await fs.readFile(fixturePath, "utf-8");
    const articleData: CogniReadArticle = JSON.parse(fileContent);

    // Se asegura el status como 'published' para que aparezca en el frontend
    articleData.status = "published";

    logger.info(`   Procesando fixture: ${path.basename(fixturePath)}`);

    const result = await createOrUpdateArticleAction(articleData);

    if (result.success) {
      console.log(
        chalk.green(
          `     ✅ Éxito: Artículo '${result.data.articleId}' sembrado/actualizado en Supabase.`
        )
      );
    } else {
      console.error(
        chalk.red.bold(
          `     🔥 Fallo al sembrar '${path.basename(fixturePath)}':`
        ),
        result.error
      );
      process.exit(1); // Salir con error si falla la siembra
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("Error crítico durante el proceso de siembra de artículo:", {
      error: errorMessage,
    });
    process.exit(1);
  } finally {
    logger.endGroup();
  }
}

seedSingleCogniReadArticle().then(() => {
  logger.success("✨ Proceso de siembra de artículo completado.");
  process.exit(0);
});
