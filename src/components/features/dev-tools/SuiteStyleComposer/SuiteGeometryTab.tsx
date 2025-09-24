// app/[locale]/(dev)/dev/_components/SuiteStyleComposer/SuiteGeometryTab.tsx
/**
 * @file SuiteGeometryTab.tsx
 * @description Aparato atómico para la pestaña de geometría.
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
import type { LoadedFragments } from "./types";

interface SuiteGeometryTabProps {
  allThemeFragments: LoadedFragments;
  selectedRadiusPreset: string;
  granularGeometry: Record<string, string>;
  onRadiusPresetChange: (value: string) => void;
  onGranularChange: (
    category: "granularGeometry",
    cssVar: string,
    value: string
  ) => void;
  content: {
    selectRadiusLabel: string;
    radiusFilterPlaceholder: string;
    defaultPresetName: string;
    borderRadiusLabel: string;
    borderWidthLabel: string;
    baseSpacingUnitLabel: string;
    inputHeightLabel: string;
  };
}

export function SuiteGeometryTab({
  allThemeFragments,
  selectedRadiusPreset,
  granularGeometry,
  onRadiusPresetChange,
  onGranularChange,
  content,
}: SuiteGeometryTabProps): React.ReactElement {
  logger.trace(
    "[SuiteGeometryTab] Renderizando pestaña de geometría (v2.0 - SSoT Aligned)."
  );

  const radiusOptions = useMemo(
    () => [
      { label: content.defaultPresetName, value: "rounded" },
      ...Object.keys(allThemeFragments.radii).map((name) => ({
        label: name,
        value: name,
      })),
    ],
    [allThemeFragments.radii, content.defaultPresetName]
  );

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <Label htmlFor="radius-preset">{content.selectRadiusLabel}</Label>
        <Select
          value={selectedRadiusPreset}
          onValueChange={onRadiusPresetChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={content.radiusFilterPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {radiusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <h4 className="font-semibold text-foreground mt-8">
        {content.borderRadiusLabel}
      </h4>
      <div>
        <GranularInputControl
          id="--radius"
          label="--radius"
          value={granularGeometry?.["--radius"] || ""}
          onChange={(value) =>
            onGranularChange("granularGeometry", "--radius", value)
          }
          placeholder="Ej. 0.5rem, 8px"
        />
      </div>

      <h4 className="font-semibold text-foreground mt-8">
        {content.borderWidthLabel}
      </h4>
      <div>
        <GranularInputControl
          id="--border-width"
          label="--border-width"
          value={granularGeometry?.["--border-width"] || ""}
          onChange={(value) =>
            onGranularChange("granularGeometry", "--border-width", value)
          }
          placeholder="Ej. 1px, 2px"
        />
      </div>

      <h4 className="font-semibold text-foreground mt-8">
        {content.baseSpacingUnitLabel}
      </h4>
      <div>
        <GranularInputControl
          id="--space"
          label="--space"
          value={granularGeometry?.["--space"] || ""}
          onChange={(value) =>
            onGranularChange("granularGeometry", "--space", value)
          }
          placeholder="Ej. 0.25rem, 4px"
        />
      </div>

      <h4 className="font-semibold text-foreground mt-8">
        {content.inputHeightLabel}
      </h4>
      <div>
        <GranularInputControl
          id="--input-height"
          label="--input-height"
          value={granularGeometry?.["--input-height"] || ""}
          onChange={(value) =>
            onGranularChange("granularGeometry", "--input-height", value)
          }
          placeholder="Ej. 2.5rem, 40px"
        />
      </div>
    </div>
  );
}
// app/[locale]/(dev)/dev/_components/SuiteStyleComposer/SuiteGeometryTab.tsx
