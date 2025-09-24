// app/[locale]/(dev)/dev/campaign-suite/_actions/_generators/generatePage.ts
/**
 * @file generatePage.ts
 * @description Módulo generador soberano para el archivo principal app/page.tsx.
 * @version 2.0.0 (Functional Implementation)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server-only";

import fs from "fs/promises";
import path from "path";
import { logger } from "@/shared/lib/logging";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";

/**
 * @function generatePage
 * @description Genera el archivo app/page.tsx principal y funcional de la campaña.
 * @param {CampaignDraft} draft - El borrador de la campaña.
 * @param {string} targetDir - El directorio raíz del proyecto exportado.
 * @returns {Promise<void>}
 */
export async function generatePage(
  draft: CampaignDraft,
  targetDir: string
): Promise<void> {
  logger.trace("[Generator] Iniciando generación de app/page.tsx (v2.0)...");

  const pageContent = `
import { CampaignThemeProvider } from "@/components/layout/CampaignThemeProvider";
import { SectionRenderer } from "@/components/layout/SectionRenderer";
import dictionaryData from "@/content/content.json";
import themeData from "@/content/theme.json";

// Definimos tipos básicos para seguridad
type Dictionary = Record<string, any>;
type Theme = { layout?: { sections?: { name: string }[] } };

export default async function HomePage() {
  const locale = "it-IT"; // Placeholder para el locale principal
  const dictionary: Dictionary = (dictionaryData as any)[locale] || {};
  const theme: Theme = themeData || {};

  if (!theme.layout?.sections) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1>Error de Configuración</h1>
        <p>La configuración del layout de la campaña no es válida o no se ha encontrado.</p>
      </div>
    );
  }

  return (
    <CampaignThemeProvider theme={theme}>
      <SectionRenderer
        sections={theme.layout.sections}
        dictionary={dictionary}
        locale={locale}
      />
    </CampaignThemeProvider>
  );
}
`;

  try {
    const appDir = path.join(targetDir, "app");
    await fs.mkdir(appDir, { recursive: true });
    const filePath = path.join(appDir, "page.tsx");
    await fs.writeFile(filePath, pageContent.trim());

    logger.trace(
      `[Generator] Archivo page.tsx escrito exitosamente en: ${filePath}`
    );
  } catch (error) {
    logger.error("[Generator] Fallo crítico al generar page.tsx.", { error });
    throw error;
  }
}
// app/[locale]/(dev)/dev/campaign-suite/_actions/_generators/generatePage.ts
