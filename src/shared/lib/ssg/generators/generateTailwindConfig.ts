// app/[locale]/(dev)/dev/campaign-suite/_actions/_generators/generateTailwindConfig.ts
/**
 * @file generateTailwindConfig.ts
 * @description Módulo generador soberano para el archivo tailwind.config.ts.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server-only";

import fs from "fs/promises";
import path from "path";
import { logger } from "@/shared/lib/logging";

/**
 * @function generateTailwindConfig
 * @description Genera y escribe un archivo tailwind.config.ts en el directorio de destino.
 * @param {string} targetDir - El directorio donde se guardará el archivo.
 * @returns {Promise<void>}
 */
export async function generateTailwindConfig(targetDir: string): Promise<void> {
  logger.trace("[Generator] Iniciando generación de tailwind.config.ts...");

  const configContent = `
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
`;

  const filePath = path.join(targetDir, "tailwind.config.ts");
  await fs.writeFile(filePath, configContent.trim());

  logger.trace(
    `[Generator] Archivo tailwind.config.ts escrito exitosamente en: ${filePath}`
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_actions/_generators/generateTailwindConfig.ts
