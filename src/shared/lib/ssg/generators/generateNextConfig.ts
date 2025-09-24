// app/[locale]/(dev)/dev/campaign-suite/_actions/_generators/generateNextConfig.ts
/**
 * @file generateNextConfig.ts
 * @description Módulo generador soberano para el archivo next.config.mjs.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server-only";

import fs from "fs/promises";
import path from "path";
import { logger } from "@/shared/lib/logging";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";

/**
 * @function generateNextConfig
 * @description Genera y escribe un archivo next.config.mjs en el directorio de destino.
 * @param {CampaignDraft} draft - El borrador de la campaña (reservado para uso futuro).
 * @param {string} targetDir - El directorio donde se guardará el archivo.
 * @returns {Promise<void>}
 */
export async function generateNextConfig(
  draft: CampaignDraft, // Recibimos el draft para futuras configuraciones
  targetDir: string
): Promise<void> {
  logger.trace("[Generator] Iniciando generación de next.config.mjs...");

  const configContent = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de Next.js para la campaña exportada.
  // Se pueden añadir aquí configuraciones específicas como remotePatterns para imágenes si es necesario.
};

export default nextConfig;
`;

  const filePath = path.join(targetDir, "next.config.mjs");
  await fs.writeFile(filePath, configContent.trim());

  logger.trace(
    `[Generator] Archivo next.config.mjs escrito exitosamente en: ${filePath}`
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_actions/_generators/generateNextConfig.ts
