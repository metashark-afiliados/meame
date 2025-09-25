// RUTA: scripts/generation/generate-lucide-icon-enum.ts
/**
 * @file generate-lucide-icon-enum.ts
 * @description Script de automatización de élite para la DX.
 *              v6.0.0 (Architectural Realignment): Se actualiza la ruta de salida
 *              para alinearse con la arquitectura FSD soberana, resolviendo el
 *              error crítico de build ENOENT.
 * @version 6.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { createRequire } from "module";
import { logger } from "@/shared/lib/logging";

const require = createRequire(import.meta.url);

// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
// La ruta de salida ahora apunta a la SSoT canónica dentro de src/shared/lib/config/
const OUTPUT_FILE = path.resolve(
  process.cwd(),
  "src",
  "shared",
  "lib",
  "config",
  "lucide-icon-names.ts"
);
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---

function kebabToPascal(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function main() {
  logger.startGroup(
    "🚀 Iniciando generación del Zod Enum para iconos de Lucide (v6.0)..."
  );

  try {
    const lucideManifestPath = require.resolve(
      "lucide-react/dynamicIconImports"
    );
    logger.trace(
      `   Manifiesto de iconos encontrado en: ${path.relative(
        process.cwd(),
        lucideManifestPath
      )}`
    );

    const manifestContent = fs.readFileSync(lucideManifestPath, "utf-8");

    const iconKeysMatches = manifestContent.matchAll(/['"]([^'"]+)['"]:/g);
    const iconKeys = Array.from(iconKeysMatches, (m) => m[1]);

    if (iconKeys.length === 0) {
      throw new Error(
        "No se encontraron claves de iconos en el manifiesto. ¿Cambió el formato del archivo de lucide-react?"
      );
    }

    const pascalCaseIconNames = iconKeys.map(kebabToPascal);

    const fileContent = `// RUTA: src/shared/lib/config/lucide-icon-names.ts
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
    // --- MEJORA DE OBSERVABILIDAD ---
    logger.info(
      `   Escribiendo manifiesto en la nueva ruta SSoT: ${chalk.yellow(
        path.relative(process.cwd(), OUTPUT_FILE)
      )}`
    );

    // Asegurarse de que el directorio de destino existe antes de escribir
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, fileContent, "utf-8");

    logger.success(
      `✅ Zod Enum y Tipo generados con éxito con ${pascalCaseIconNames.length} iconos registrados.`
    );
  } catch (error) {
    logger.error("🔥 Error crítico durante la generación del enum:", { error });
    process.exit(1);
  } finally {
    logger.endGroup();
  }
}

main();
// RUTA: scripts/generation/generate-lucide-icon-enum.ts
