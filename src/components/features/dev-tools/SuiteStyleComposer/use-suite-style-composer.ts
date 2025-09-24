// RUTA: components/dev/SuiteStyleComposer/use-suite-style-composer.ts
/**
 * @file use-suite-style-composer.ts
 * @description Hook "cerebro" para el Compositor de Estilos.
 *              v3.1.0 (Code Hygiene): Resuelve advertencias de linting
 *              (prefer-const, exhaustive-deps) para una calidad de código de élite.
 * @version 3.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { deepMerge } from "@/shared/lib/utils";
import {
  AssembledThemeSchema,
  type AssembledTheme,
} from "@/shared/lib/schemas/theming/assembled-theme.schema";
import { generateCssVariablesFromTheme } from "@/shared/lib/utils/theming/theme-utils";
import { logger } from "@/shared/lib/logging";
import type { SuiteThemeConfig, LoadedFragments } from "./types";

const PREVIEW_STYLE_TAG_ID = "dcc-preview-theme-overrides";

interface UseSuiteStyleComposerProps {
  initialConfig: SuiteThemeConfig;
  allThemeFragments: LoadedFragments;
}

export function useSuiteStyleComposer({
  initialConfig,
  allThemeFragments,
}: UseSuiteStyleComposerProps) {
  logger.trace(
    "[useSuiteStyleComposer] Inicializando hook v3.1 (Code Hygiene)."
  );

  const [localSuiteConfig, setLocalSuiteConfig] =
    useState<SuiteThemeConfig>(initialConfig);
  const isMounted = useRef(false);

  const clearPreview = useCallback(() => {
    const styleTag = document.getElementById(PREVIEW_STYLE_TAG_ID);
    if (styleTag) {
      styleTag.remove();
      logger.trace(
        "[useSuiteStyleComposer] Estilos de previsualización limpiados."
      );
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearPreview();
    };
  }, [clearPreview]); // Se añade 'clearPreview' a las dependencias

  const assembleAndApplyPreview = useCallback(
    (config: SuiteThemeConfig) => {
      const {
        colorPreset,
        fontPreset,
        radiusPreset,
        granularColors,
        granularFonts,
        granularGeometry,
      } = config;

      const baseFragment = allThemeFragments.base || {};
      const colorFragment = colorPreset
        ? (allThemeFragments.colors[colorPreset] ?? {})
        : {};
      const fontFragment = fontPreset
        ? (allThemeFragments.fonts[fontPreset] ?? {})
        : {};
      const radiusFragment = radiusPreset
        ? (allThemeFragments.radii[radiusPreset] ?? {})
        : {};

      const finalTheme: Partial<AssembledTheme> = deepMerge(
        deepMerge(baseFragment, colorFragment),
        deepMerge(fontFragment, radiusFragment)
      );

      if (granularColors)
        finalTheme.colors = deepMerge(finalTheme.colors || {}, granularColors);
      if (granularFonts)
        finalTheme.fonts = deepMerge(finalTheme.fonts || {}, granularFonts);
      if (granularGeometry)
        finalTheme.geometry = deepMerge(
          finalTheme.geometry || {},
          granularGeometry
        );

      const validation = AssembledThemeSchema.safeParse(finalTheme);
      if (!validation.success) {
        logger.warn(
          "[useSuiteStyleComposer] El tema de previsualización es inválido."
        );
        return;
      }

      const cssVars = generateCssVariablesFromTheme(validation.data);
      let styleTag = document.getElementById(
        PREVIEW_STYLE_TAG_ID
      ) as HTMLStyleElement;
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = PREVIEW_STYLE_TAG_ID;
        document.head.appendChild(styleTag);
      }
      styleTag.innerHTML = `:root { ${cssVars} }`;
    },
    [allThemeFragments]
  );

  useEffect(() => {
    if (isMounted.current) {
      assembleAndApplyPreview(localSuiteConfig);
    }
  }, [localSuiteConfig, assembleAndApplyPreview]);

  const handleConfigUpdate = (newPartialConfig: Partial<SuiteThemeConfig>) => {
    setLocalSuiteConfig((prev) => deepMerge(prev, newPartialConfig));
  };

  const handleGranularChange = (
    category: "granularColors" | "granularFonts" | "granularGeometry",
    cssVar: string,
    value: string
  ) => {
    setLocalSuiteConfig((prev) => {
      const newCategory = { ...(prev[category] || {}), [cssVar]: value };
      return { ...prev, [category]: newCategory };
    });
  };

  return {
    localSuiteConfig,
    handleConfigUpdate,
    handleGranularChange,
    clearPreview,
  };
}
