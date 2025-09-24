// scripts/generation/generate-lucide-icon-enum.ts
/**
 * @file generate-lucide-icon-enum.ts
 * @description Script de automatización de élite para la DX.
 *              v5.1.0 (Robust Regex): Se actualiza la expresión regular para
 *              soportar tanto comillas simples como dobles, resolviendo el
 *              error de parseo del manifiesto.
 * @version 5.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const OUTPUT_FILE = path.resolve(
  process.cwd(),
  "config",
  "lucide-icon-names.ts"
);

function kebabToPascal(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function main() {
  console.log(
    chalk.blue("🚀 Iniciando generación del Zod Enum para iconos de Lucide...")
  );

  try {
    const lucideManifestPath = require.resolve(
      "lucide-react/dynamicIconImports"
    );
    console.log(
      chalk.gray(
        `   Manifiesto de iconos encontrado en: ${path.relative(process.cwd(), lucideManifestPath)}`
      )
    );

    const manifestContent = fs.readFileSync(lucideManifestPath, "utf-8");

    // --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
    // La nueva regex /['"]([^'"]+)['"]:/g busca una comilla (simple o doble),
    // captura cualquier caracter que NO sea una comilla, y luego busca la comilla
    // de cierre y los dos puntos. Esto es mucho más robusto.
    const iconKeysMatches = manifestContent.matchAll(/['"]([^'"]+)['"]:/g);
    // --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---

    const iconKeys = Array.from(iconKeysMatches, (m) => m[1]);

    if (iconKeys.length === 0) {
      throw new Error(
        "No se encontraron claves de iconos en el manifiesto. ¿Cambió el formato del archivo de lucide-react?"
      );
    }

    const pascalCaseIconNames = iconKeys.map(kebabToPascal);

    const fileContent = `// config/lucide-icon-names.ts
/**
 * @file lucide-icon-names.ts
 * @description Manifiesto de Nombres de Iconos de Lucide y SSoT.
 *              ESTE ARCHIVO ES GENERADO AUTOMÁTICAMENTE. NO LO EDITE MANUALMENTE.
 *              Ejecute 'pnpm gen:icons' para actualizarlo.
 * @author Script de Generación Automática
 * @version ${new Date().toISOString()}
 */
import { z } from "zod";

export const lucideIconNames = ${JSON.stringify(
      pascalCaseIconNames,
      null,
      2
    )} as const;

export const LucideIconNameSchema = z.enum(lucideIconNames);

export type LucideIconName = z.infer<typeof LucideIconNameSchema>;
`;

    fs.writeFileSync(OUTPUT_FILE, fileContent, "utf-8");

    console.log(
      chalk.green(
        `✅ Zod Enum y Tipo generados con éxito en ${chalk.yellow(
          path.relative(process.cwd(), OUTPUT_FILE)
        )}`
      )
    );
    console.log(
      chalk.cyan(
        `   Total de ${pascalCaseIconNames.length} iconos registrados.`
      )
    );
  } catch (error) {
    console.error(
      chalk.red.bold("🔥 Error crítico durante la generación del enum:"),
      error
    );
    process.exit(1);
  }
}

main();
// scripts/generation/generate-lucide-icon-enum.ts
