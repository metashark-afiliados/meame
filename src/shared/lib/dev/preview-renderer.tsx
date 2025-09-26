// RUTA: src/shared/lib/dev/preview-renderer.tsx
/**
 * @file preview-renderer.tsx
 * @description Motor de renderizado soberano para las vistas previas de componentes.
 * @version 1.0.0 (Reconstruction from scratch)
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import * as React from "react";
import { previewRenderers } from "@/shared/lib/dev/preview-renderers";
import { defaultLocale } from "@/shared/lib/i18n/i18n.config";
import { deepMerge } from "@/shared/lib/utils";
import { loadJsonAsset } from "@/shared/lib/i18n/campaign.data.loader";
import type { AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";
import { AssembledThemeSchema } from "@/shared/lib/schemas/theming/assembled-theme.schema";
import { logger } from "@/shared/lib/logging";

async function assembleDefaultTheme(): Promise<AssembledTheme> {
  try {
    const [base, colors, fonts, radii] = await Promise.all([
      loadJsonAsset<Partial<AssembledTheme>>("theme-fragments", "base", "global.theme.json"),
      loadJsonAsset<Partial<AssembledTheme>>("theme-fragments", "colors", "razstore-minimalist.colors.json"),
      loadJsonAsset<Partial<AssembledTheme>>("theme-fragments", "fonts", "razstore-minimalist.fonts.json"),
      loadJsonAsset<Partial<AssembledTheme>>("theme-fragments", "radii", "razstore-minimalist.radii.json"),
    ]);
    const finalTheme = deepMerge(deepMerge(deepMerge(base, colors), fonts), radii);
    return AssembledThemeSchema.parse(finalTheme);
  } catch (error) {
    logger.error("[PreviewRenderer] No se pudo ensamblar el tema por defecto.", { error });
    // Devuelve un objeto de tema vacío como fallback
    return AssembledThemeSchema.parse({});
  }
}

export async function renderPreviewComponent(componentName: string) {
  const renderer = previewRenderers[componentName];
  if (!renderer) {
    logger.warn(`[PreviewRenderer] No se encontró un renderizador para: ${componentName}`);
    return null;
  }
  const theme = await assembleDefaultTheme();
  return renderer(defaultLocale, theme);
}
