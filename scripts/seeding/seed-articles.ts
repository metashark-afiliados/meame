// scripts/seeding/seed-articles.ts
/**
 * @file seed-articles.ts
 * @description Script de "siembra" para poblar la colección de artículos de CogniRead.
 * @version 1.1.0 (Decoupled from env loading)
 * @author RaZ Podestá - MetaShark Tech
 */
import { promises as fs } from "fs";
import path from "path";
import chalk from "chalk";
import { createOrUpdateArticleAction } from "@/app/[locale]/(dev)/cogniread/_actions";
import type { CogniReadArticle } from "@/shared/lib/schemas/cogniread/article.schema";

// Ya no necesita importar 'dotenv'

async function seedArticles() {
  console.log(
    chalk.cyan.bold("🌱 Iniciando siembra de la base de datos de CogniRead...")
  );

  try {
    const fixturesDir = path.join(process.cwd(), "content/cogniread/fixtures");
    const files = await fs.readdir(fixturesDir);
    const articleFiles = files.filter((file) =>
      file.endsWith(".article.json")
    );

    if (articleFiles.length === 0) {
      console.log(
        chalk.yellow(
          "No se encontraron artículos de prueba en 'content/cogniread/fixtures'."
        )
      );
      return;
    }

    console.log(
      chalk.gray(
        `   Encontrados ${articleFiles.length} artículos de prueba para sembrar...`
      )
    );

    for (const fileName of articleFiles) {
      const filePath = path.join(fixturesDir, fileName);
      console.log(chalk.gray(`   - Procesando: ${fileName}`));

      const fileContent = await fs.readFile(filePath, "utf-8");
      const articleData: CogniReadArticle = JSON.parse(fileContent);

      const result = await createOrUpdateArticleAction(articleData);

      if (result.success) {
        console.log(
          chalk.green(
            `     ✅ Éxito: Artículo '${result.data.articleId}' sembrado/actualizado.`
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
    console.error(
      chalk.red.bold("\n❌ Error crítico durante el proceso de siembra:"),
      error
    );
    process.exit(1);
  }
}

seedArticles().then(() => {
  console.log(
    chalk.green.bold("\n✨ Proceso de siembra de artículos completado.")
  );
});
// scripts/seeding/seed-articles.ts
