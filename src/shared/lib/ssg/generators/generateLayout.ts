// app/[locale]/(dev)/dev/campaign-suite/_actions/_generators/generateLayout.ts
/**
 * @file generateLayout.ts
 * @description Módulo generador soberano para el archivo raíz app/layout.tsx.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server-only";

import fs from "fs/promises";
import path from "path";
import { logger } from "@/shared/lib/logging";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import { loadJsonAsset } from "@/shared/lib/i18n/campaign.data.loader";
import type { AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";
import { deepMerge } from "@/shared/lib/utils";

/**
 * @function generateLayout
 * @description Genera el archivo app/layout.tsx con importaciones de fuentes dinámicas.
 * @param {CampaignDraft} draft - El borrador de la campaña.
 * @param {string} targetDir - El directorio raíz del proyecto exportado.
 * @returns {Promise<void>}
 */
export async function generateLayout(
  draft: CampaignDraft,
  targetDir: string
): Promise<void> {
  logger.trace("[Generator] Iniciando generación de app/layout.tsx...");

  try {
    // 1. Ensamblar el tema para leer las fuentes necesarias.
    const { colorPreset, fontPreset, radiusPreset, themeOverrides } =
      draft.themeConfig;
    const [base, colors, fonts, radii] = await Promise.all([
      loadJsonAsset<Partial<AssembledTheme>>(
        "theme-fragments",
        "base",
        "global.theme.json"
      ),
      colorPreset
        ? loadJsonAsset<Partial<AssembledTheme>>(
            "theme-fragments",
            "colors",
            `${colorPreset}.colors.json`
          )
        : Promise.resolve({}),
      fontPreset
        ? loadJsonAsset<Partial<AssembledTheme>>(
            "theme-fragments",
            "fonts",
            `${fontPreset}.fonts.json`
          )
        : Promise.resolve({}),
      radiusPreset
        ? loadJsonAsset<Partial<AssembledTheme>>(
            "theme-fragments",
            "radii",
            `${radiusPreset}.radii.json`
          )
        : Promise.resolve({}),
    ]);
    const finalTheme = deepMerge(
      deepMerge(deepMerge(deepMerge(base, colors), fonts), radii),
      themeOverrides ?? {}
    );

    // 2. Determinar qué fuentes importar.
    const fontImports: string[] = [];
    const fontVariables: string[] = [];
    if (finalTheme.fonts?.sans?.includes("Inter")) {
      fontImports.push(`import { Inter } from "next/font/google";`);
      fontVariables.push(
        `const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });`
      );
    }
    if (finalTheme.fonts?.serif?.includes("Poppins")) {
      fontImports.push(`import { Poppins } from "next/font/google";`);
      fontVariables.push(
        `const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-serif" });`
      );
    }
    // Añadir más lógicas de fuentes aquí si es necesario.

    // 3. Construir el contenido del archivo layout.tsx.
    const layoutContent = `
import type { Metadata } from "next";
${fontImports.join("\n")}
import "./globals.css";

${fontVariables.join("\n")}

export const metadata: Metadata = {
  title: "${draft.variantName || "Campaña Generada"}",
  description: "Landing page generada por la SDC de webvork.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={\`${fontVariables
      .map((v) => `\${${v.split(" ")[1]}.variable}`)
      .join(" ")}\`}>
      <body>{children}</body>
    </html>
  );
}
`;

    const appDir = path.join(targetDir, "app");
    await fs.mkdir(appDir, { recursive: true });
    const filePath = path.join(appDir, "layout.tsx");
    await fs.writeFile(filePath, layoutContent.trim());

    logger.trace(
      `[Generator] Archivo layout.tsx escrito exitosamente en: ${filePath}`
    );
  } catch (error) {
    logger.error("[Generator] Fallo crítico al generar layout.tsx.", { error });
    throw error;
  }
}
// app/[locale]/(dev)/dev/campaign-suite/_actions/_generators/generateLayout.ts
