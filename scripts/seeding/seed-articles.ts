// RUTA: scripts/seeding/seed-articles.ts
/**
 * @file seed-articles.ts
 * @description Script de "siembra" para poblar la colección de artículos de CogniRead.
 *              v3.0.0 (Holistic Build Integrity Restoration): Resuelve una cascada de
 *              errores de sintaxis, resolución de módulos y rutas de importación para
 *              garantizar la compatibilidad total con el entorno de ejecución de scripts.
 * @version 3.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { promises as fs } from "fs";
// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE] ---
// Se corrige la sintaxis de importación de módulos y las rutas de los alias.
import * as path from "path";
import chalk from "chalk";
import { createId } from "@paralleldrive/cuid2";
import { connectToDatabase } from "../../src/shared/lib/mongodb";
import {
  CogniReadArticleSchema,
  type CogniReadArticle,
} from "../../src/shared/lib/schemas/cogniread/article.schema";
import { logger } from "../../src/shared/lib/logging";
// --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

// --- Lógica de Base de Datos (replicada desde la Server Action) ---
async function createOrUpdateArticle(
  articleData: CogniReadArticle
): Promise<{ success: boolean; articleId: string; error?: string }> {
  const now = new Date().toISOString();
  const articleId = articleData.articleId || createId();

  const articleDocument: CogniReadArticle = {
    ...articleData,
    articleId,
    updatedAt: now,
    createdAt: articleData.createdAt || now,
  };

  const validation = CogniReadArticleSchema.safeParse(articleDocument);
  if (!validation.success) {
    return {
      success: false,
      articleId,
      error: "Datos del artículo inválidos.",
    };
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection<CogniReadArticle>("articles");

    await collection.updateOne(
      { articleId: validation.data.articleId },
      { $set: validation.data },
      { upsert: true }
    );

    return { success: true, articleId };
  } catch (error) {
    return {
      success: false,
      articleId,
      error:
        error instanceof Error ? error.message : "Error desconocido en DB.",
    };
  }
}
// --- Fin de la Lógica de Base de Datos ---

async function seedArticles() {
  logger.startGroup(
    "🌱 Iniciando siembra de DB CogniRead (v3.0 - Build Integrity)..."
  );

  try {
    const fixturesDir = path.join(process.cwd(), "content/cogniread/fixtures");
    const files = await fs.readdir(fixturesDir);
    const articleFiles = files.filter((file) => file.endsWith(".article.json"));

    if (articleFiles.length === 0) {
      logger.warn(
        "No se encontraron artículos de prueba en 'content/cogniread/fixtures'."
      );
      return;
    }

    logger.info(
      `   Encontrados ${articleFiles.length} artículos de prueba para sembrar...`
    );

    for (const fileName of articleFiles) {
      const filePath = path.join(fixturesDir, fileName);
      logger.trace(`   - Procesando: ${fileName}`);

      const fileContent = await fs.readFile(filePath, "utf-8");
      const articleData: CogniReadArticle = JSON.parse(fileContent);

      const result = await createOrUpdateArticle(articleData);

      if (result.success) {
        console.log(
          chalk.green(
            `     ✅ Éxito: Artículo '${result.articleId}' sembrado/actualizado.`
          )
        );
      } else {
        console.error(
          chalk.red.bold(`     🔥 Fallo al sembrar '${fileName}':`),
          result.error
        );
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("Error crítico durante el proceso de siembra:", {
      error: errorMessage,
    });
    process.exit(1);
  } finally {
    logger.endGroup();
  }
}

seedArticles().then(() => {
  logger.success("✨ Proceso de siembra de artículos completado.");
  process.exit(0);
});
