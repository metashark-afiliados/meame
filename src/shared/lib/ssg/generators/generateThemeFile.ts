// app/[locale]/(dev)/dev/campaign-suite/_actions/_generators/generateThemeFile.ts
/**
 * @file generateThemeFile.ts
 * @description Módulo generador soberano para el archivo de configuración de tema (layout).
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server-only";

import fs from "fs/promises";
import path from "path";
import { logger } from "@/shared/lib/logging";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";

/**
 * @function generateThemeFile
 * @description Extrae el layout del borrador y lo escribe en un archivo theme.json.
 * @param {CampaignDraft} draft - El borrador de la campaña.
 * @param {string} targetDir - El directorio raíz del proyecto exportado.
 * @returns {Promise<void>}
 */
export async function generateThemeFile(
  draft: CampaignDraft,
  targetDir: string
): Promise<void> {
  logger.trace("[Generator] Iniciando generación de content/theme.json...");

  try {
    const themeObject = {
      layout: {
        sections: draft.layoutConfig,
      },
    };

    const contentDir = path.join(targetDir, "content");
    await fs.mkdir(contentDir, { recursive: true });

    const fileContent = JSON.stringify(themeObject, null, 2);
    const filePath = path.join(contentDir, "theme.json");
    await fs.writeFile(filePath, fileContent);

    logger.trace(
      `[Generator] Archivo theme.json escrito exitosamente en: ${filePath}`
    );
  } catch (error) {
    logger.error("[Generator] Fallo crítico al generar theme.json.", {
      error,
    });
    throw error;
  }
}
// app/[locale]/(dev)/dev/campaign-suite/_actions/_generators/generateThemeFile.ts
