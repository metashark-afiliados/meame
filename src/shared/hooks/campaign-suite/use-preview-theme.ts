// RUTA: src/shared/hooks/campaign-suite/use-preview-theme.ts
/**
 * @file use-preview-theme.ts
 * @description Hook atómico para ensamblar el tema de la vista previa.
 *              v4.0.0 (Atomic State Alignment): Refactorizado para alinearse
 *              con la arquitectura de stores atómicos.
 * @version 4.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useStep3ThemeStore } from "./use-step3-theme.store";
import { usePreviewStore } from "@/components/features/campaign-suite/_context/PreviewContext";
import { deepMerge } from "@/shared/lib/utils";
import type { AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";
import { AssembledThemeSchema } from "@/shared/lib/schemas/theming/assembled-theme.schema";
import { loadJsonAsset } from "@/shared/lib/i18n/campaign.data.loader";

interface UsePreviewThemeReturn {
  theme: AssembledTheme | null;
  isLoading: boolean;
  error: string | null;
}

export function usePreviewTheme(): UsePreviewThemeReturn {
  const themeConfig = useStep3ThemeStore((state) => state.themeConfig);
  const previewThemeFromStore = usePreviewStore((state) => state.previewTheme);
  const [theme, setTheme] = useState<AssembledTheme | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveThemeSource = useMemo(() => {
    if (previewThemeFromStore) {
      return { source: "preview", data: previewThemeFromStore };
    }
    return { source: "draft", data: themeConfig };
  }, [previewThemeFromStore, themeConfig]);

  useEffect(() => {
    const assembleTheme = async () => {
      const { source, data } = effectiveThemeSource;
      if (source === "preview" && data) {
        setTheme(data as AssembledTheme);
        return;
      }

      const config = data as typeof themeConfig;
      const { colorPreset, fontPreset, radiusPreset, themeOverrides } = config;

      if (!colorPreset || !fontPreset || !radiusPreset) {
        setTheme(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const [base, colors, fonts, radii] = await Promise.all([
          loadJsonAsset<Partial<AssembledTheme>>(
            "theme-fragments",
            "base",
            "global.theme.json"
          ),
          loadJsonAsset<Partial<AssembledTheme>>(
            "theme-fragments",
            "colors",
            `${colorPreset}.colors.json`
          ),
          loadJsonAsset<Partial<AssembledTheme>>(
            "theme-fragments",
            "fonts",
            `${fontPreset}.fonts.json`
          ),
          loadJsonAsset<Partial<AssembledTheme>>(
            "theme-fragments",
            "radii",
            `${radiusPreset}.radii.json`
          ),
        ]);

        const finalThemeObject = deepMerge(
          deepMerge(deepMerge(deepMerge(base, colors), fonts), radii),
          themeOverrides ?? {}
        );
        const validation = AssembledThemeSchema.safeParse(finalThemeObject);
        if (!validation.success) throw new Error("Tema ensamblado inválido.");
        setTheme(validation.data);
      } catch (e) {
        const err = e instanceof Error ? e.message : "Error desconocido.";
        setError(err);
        setTheme(null);
      } finally {
        setIsLoading(false);
      }
    };
    assembleTheme();
  }, [effectiveThemeSource]);

  return { theme, isLoading, error };
}
