// scripts/generation/build-i18n-dictionaries.ts
/**
 * @file build-i18n-dictionaries.ts
 * @description Script de build incremental e inteligente para la internacionalización.
 *              Utiliza un sistema de caché basado en hashes para reconstruir los
 *              diccionarios solo cuando los archivos de origen han cambiado. Ahora
 *              es más robusto a JSON malformados en archivos individuales.
 * @version 5.1.0 (Robust JSON Parsing)
 * @author RaZ Podestá - MetaShark Tech
 */
import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";
import hash from "object-hash";
import { supportedLocales } from "@/shared/lib/i18n/i18n.config";
import { i18nSchema } from "@/shared/lib/schemas/i18n.schema";
import { discoverAndReadI18nFiles } from "@/shared/lib/dev/i18n-discoverer";
import { logger } from "@/shared/lib/logging";

const OUTPUT_DIR = path.resolve(process.cwd(), "public/locales");
const CACHE_DIR = path.resolve(process.cwd(), ".i18n-cache");
const HASH_CACHE_FILE = path.join(CACHE_DIR, "hashes.json");

type HashCache = {
  [filePath: string]: string;
};

async function readHashCache(): Promise<HashCache> {
  try {
    const content = await fs.readFile(HASH_CACHE_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function writeHashCache(cache: HashCache): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(HASH_CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function buildDictionaries() {
  logger.startGroup(
    "🚀 Iniciando compilación de diccionarios i18n (v5.1 - Incremental y Robusto)..."
  );

  const isProduction = process.env.NODE_ENV === "production";

  // discoverAndReadI18nFiles ahora manejará los errores de parsing individualmente
  const { files, contents } = await discoverAndReadI18nFiles({
    excludeDevContent: isProduction,
  });

  const oldHashes = await readHashCache();
  const newHashes: HashCache = {};
  let hasChanges = false;
  let hasSchemaChanged = false;

  const i18nSchemaPath = path.resolve(
    process.cwd(),
    "lib/schemas/i18n.schema.ts"
  );
  try {
    const schemaContent = await fs.readFile(i18nSchemaPath, "utf-8");
    const schemaHash = hash(schemaContent);
    newHashes["schema"] = schemaHash;
    if (oldHashes["schema"] !== schemaHash) {
      hasSchemaChanged = true;
    }
  } catch {
    hasSchemaChanged = true; // Si no se puede leer, asumimos que cambió
  }

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const content = contents[i];
    // Ahora 'content' está garantizado que es un objeto parseado correctamente,
    // o el archivo fue omitido.
    const currentHash = hash(content);
    newHashes[filePath] = currentHash;
    if (oldHashes[filePath] !== currentHash) {
      hasChanges = true;
    }
  }

  if (
    !hasChanges &&
    !hasSchemaChanged &&
    Object.keys(oldHashes).length === files.length + 1
  ) {
    logger.success(
      "✨ No se detectaron cambios en los archivos de contenido o schema. El build se omite."
    );
    logger.endGroup();
    return;
  }

  if (hasSchemaChanged) {
    console.log(
      chalk.yellow(
        "   Cambio detectado en el schema de i18n. Reconstrucción forzada..."
      )
    );
  } else {
    console.log(
      chalk.yellow(
        "   Cambios de contenido detectados. Reconstruyendo diccionarios..."
      )
    );
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  let validationFailed = false;

  for (const locale of supportedLocales) {
    logger.startGroup(`   Ensamblando diccionario para [${locale}]...`);
    const fullDictionary = contents.reduce((acc, moduleContent) => {
      const contentForLocale = moduleContent[locale];
      return { ...acc, ...(contentForLocale || {}) };
    }, {});

    const validation = i18nSchema.safeParse(fullDictionary);

    if (!validation.success) {
      console.error(
        chalk.red.bold(`  🔥 ¡FALLO DE VALIDACIÓN para [${locale}]!`)
      );
      console.error(
        chalk.red(
          JSON.stringify(validation.error.flatten().fieldErrors, null, 2)
        )
      );
      validationFailed = true;
    }

    const outputPath = path.join(OUTPUT_DIR, `${locale}.json`);
    await fs.writeFile(
      outputPath,
      JSON.stringify(validation.data || fullDictionary, null, 2),
      "utf-8"
    );

    if (validation.success) {
      logger.success(`  ✅ Diccionario para [${locale}] compilado con éxito.`);
    } else {
      logger.warn(`  ⚠️  Diccionario para [${locale}] compilado CON ERRORES.`);
    }
    logger.endGroup();
  }

  await writeHashCache(newHashes);

  if (validationFailed && isProduction) {
    console.error(
      chalk.red.bold(
        "\n❌ Error Crítico: Fallo de validación en modo PRODUCCIÓN."
      )
    );
    process.exit(1);
  }

  logger.success("\n✨ Proceso de compilación de i18n completado.");
  logger.endGroup();
}

buildDictionaries().catch((error) => {
  console.error(
    chalk.red.bold("\n❌ Error fatal durante la compilación:"),
    error
  );
  process.exit(1);
});
