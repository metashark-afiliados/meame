// app/[locale]/(dev)/dev/campaign-suite/_actions/_generators/generatePostcssConfig.ts
/**
 * @file generatePostcssConfig.ts
 * @description Módulo generador soberano para el archivo postcss.config.mjs.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server-only";

import fs from "fs/promises";
import path from "path";
import { logger } from "@/shared/lib/logging";

/**
 * @function generatePostcssConfig
 * @description Genera y escribe un archivo postcss.config.mjs en el directorio de destino.
 * @param {string} targetDir - El directorio donde se guardará el archivo.
 * @returns {Promise<void>}
 */
export async function generatePostcssConfig(targetDir: string): Promise<void> {
  logger.trace("[Generator] Iniciando generación de postcss.config.mjs...");

  const configContent = `
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
`;

  const filePath = path.join(targetDir, "postcss.config.mjs");
  await fs.writeFile(filePath, configContent.trim());

  logger.trace(
    `[Generator] Archivo postcss.config.mjs escrito exitosamente en: ${filePath}`
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_actions/_generators/generatePostcssConfig.ts
