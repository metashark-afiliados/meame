// app/[locale]/(dev)/dev/_components/SuiteStyleComposer/SuiteTypographyTab.tsx
/**
 * @file SuiteTypographyTab.tsx
 * @description Aparato atómico para la pestaña de tipografía.
 * @version 2.0.0 (SSoT Type Alignment)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { logger } from "@/shared/lib/logging";
import { GranularInputControl } from "./GranularInputControl";
// --- [INICIO] REFACTORIZACIÓN ARQUITECTÓNICA ---
// Se importa el tipo desde la nueva SSoT y se eliminan las importaciones innecesarias.
import type { LoadedFragments } from "./types";
// --- [FIN] REFACTORIZACIÓN ARQUITECTÓNICA ---

interface SuiteTypographyTabProps {
  allThemeFragments: LoadedFragments;
  selectedFontPreset: string;
  granularFonts: Record<string, string>;
  onFontPresetChange: (value: string) => void;
  onGranularChange: (
    category: "granularFonts",
    cssVar: string,
    value: string
  ) => void;
  content: {
    selectFontLabel: string;
    fontFilterPlaceholder: string;
    defaultPresetName: string;
    fontSizeLabel: string;
    fontWeightLabel: string;
    lineHeightLabel: string;
    letterSpacingLabel: string;
  };
}

export function SuiteTypographyTab({
  allThemeFragments,
  selectedFontPreset,
  granularFonts,
  onFontPresetChange,
  onGranularChange,
  content,
}: SuiteTypographyTabProps): React.ReactElement {
  logger.trace(
    "[SuiteTypographyTab] Renderizando pestaña de tipografía (v2.0 - SSoT Aligned)."
  );

  const fontOptions = useMemo(
    () => [
      { label: content.defaultPresetName, value: "minimalist-sans" },
      ...Object.keys(allThemeFragments.fonts).map((name) => ({
        label: name,
        value: name,
      })),
    ],
    [allThemeFragments.fonts, content.defaultPresetName]
  );

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <Label htmlFor="font-preset">{content.selectFontLabel}</Label>
        <Select value={selectedFontPreset} onValueChange={onFontPresetChange}>
          <SelectTrigger>
            <SelectValue placeholder={content.fontFilterPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <h4 className="font-semibold text-foreground mt-8">
        {content.fontSizeLabel}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          "--text-xs",
          "--text-sm",
          "--text-base",
          "--text-lg",
          "--text-xl",
          "--text-2xl",
        ].map((cssVar) => (
          <GranularInputControl
            key={cssVar}
            id={cssVar}
            label={cssVar.replace("--text-", "Tamaño ")}
            value={granularFonts?.[cssVar] || ""}
            onChange={(value) =>
              onGranularChange("granularFonts", cssVar, value)
            }
            placeholder="Ej. 16px, 1.125rem"
          />
        ))}
      </div>

      <h4 className="font-semibold text-foreground mt-8">
        {content.fontWeightLabel}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          "--font-weight-light",
          "--font-weight-normal",
          "--font-weight-medium",
          "--font-weight-semibold",
          "--font-weight-bold",
        ].map((cssVar) => (
          <GranularInputControl
            key={cssVar}
            id={cssVar}
            label={cssVar.replace("--font-weight-", "Peso ")}
            value={granularFonts?.[cssVar] || ""}
            onChange={(value) =>
              onGranularChange("granularFonts", cssVar, value)
            }
            placeholder="Ej. 400, 700"
            type="number"
          />
        ))}
      </div>

      <h4 className="font-semibold text-foreground mt-8">
        {content.lineHeightLabel}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          "--leading-none",
          "--leading-tight",
          "--leading-snug",
          "--leading-normal",
          "--leading-relaxed",
          "--leading-loose",
        ].map((cssVar) => (
          <GranularInputControl
            key={cssVar}
            id={cssVar}
            label={cssVar.replace("--leading-", "Altura de Línea ")}
            value={granularFonts?.[cssVar] || ""}
            onChange={(value) =>
              onGranularChange("granularFonts", cssVar, value)
            }
            placeholder="Ej. 1, 1.25, 1.5"
            type="number"
          />
        ))}
      </div>

      <h4 className="font-semibold text-foreground mt-8">
        {content.letterSpacingLabel}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          "--tracking-tighter",
          "--tracking-tight",
          "--tracking-normal",
          "--tracking-wide",
        ].map((cssVar) => (
          <GranularInputControl
            key={cssVar}
            id={cssVar}
            label={cssVar.replace("--tracking-", "Espaciado ")}
            value={granularFonts?.[cssVar] || ""}
            onChange={(value) =>
              onGranularChange("granularFonts", cssVar, value)
            }
            placeholder="Ej. -0.05em, 0.025em"
          />
        ))}
      </div>
    </div>
  );
}
// app/[locale]/(dev)/dev/_components/SuiteStyleComposer/SuiteTypographyTab.tsx
