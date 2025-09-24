// app/[locale]/(dev)/dev/campaign-suite/_components/Step3_Theme/_components/ThemeSelectorGroup.tsx
/**
 * @file ThemeSelectorGroup.tsx
 * @description Aparato de UI que agrupa los selectores de fragmentos de tema.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import type { ThemeConfig } from "@/shared/lib/types/campaigns/draft.types";
import type { DiscoveredFragments } from "../../../_actions/getThemeFragments.action";
import { ThemeFragmentSelector } from "./ThemeFragmentSelector";
import { logger } from "@/shared/lib/logging";
import type { Step3ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step3.schema";
import type { z } from "zod";

type Content = z.infer<typeof Step3ContentSchema>;

interface ThemeSelectorGroupProps {
  content: Pick<
    Content,
    | "themeSelectorTitle"
    | "colorsLabel"
    | "fontsLabel"
    | "radiiLabel"
    | "colorsPlaceholder"
    | "fontsPlaceholder"
    | "radiiPlaceholder"
  >;
  themeConfig: ThemeConfig;
  themeFragments: DiscoveredFragments;
  onThemeConfigChange: (newConfig: Partial<ThemeConfig>) => void;
  isPending: boolean;
}

export function ThemeSelectorGroup({
  content,
  themeConfig,
  themeFragments,
  onThemeConfigChange,
  isPending,
}: ThemeSelectorGroupProps): React.ReactElement {
  logger.trace(
    "[ThemeSelectorGroup] Renderizando grupo de selectores de tema."
  );

  return (
    <div className="space-y-6 p-6 border rounded-lg bg-muted/20">
      <div>
        <h3 className="font-semibold text-lg text-foreground">
          {content.themeSelectorTitle}
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ThemeFragmentSelector
          label={content.colorsLabel}
          value={themeConfig.colorPreset}
          onValueChange={(value) => onThemeConfigChange({ colorPreset: value })}
          placeholder={content.colorsPlaceholder}
          options={themeFragments.colors}
          isDisabled={isPending}
        />
        <ThemeFragmentSelector
          label={content.fontsLabel}
          value={themeConfig.fontPreset}
          onValueChange={(value) => onThemeConfigChange({ fontPreset: value })}
          placeholder={content.fontsPlaceholder}
          options={themeFragments.fonts}
          isDisabled={isPending}
        />
        <ThemeFragmentSelector
          label={content.radiiLabel}
          value={themeConfig.radiusPreset}
          onValueChange={(value) =>
            onThemeConfigChange({ radiusPreset: value })
          }
          placeholder={content.radiiPlaceholder}
          options={themeFragments.radii}
          isDisabled={isPending}
        />
      </div>
    </div>
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_components/Step3_Theme/_components/ThemeSelectorGroup.tsx
