// RUTA: src/components/features/dev-tools/SuiteStyleComposer/_components/SuiteGeometryTab.tsx
/**
 * @file SuiteGeometryTab.tsx
 * @description Aparato de UI atómico para la selección de presets de geometría.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import type { LoadedFragments } from "./types";

interface SuiteGeometryTabProps {
  allThemeFragments: LoadedFragments;
  selectedRadiusPreset: string;
  onRadiusPresetChange: (value: string) => void;
  content: {
    selectRadiusLabel: string;
    radiusFilterPlaceholder: string;
    defaultPresetName: string;
  };
}

export function SuiteGeometryTab({
  allThemeFragments,
  selectedRadiusPreset,
  onRadiusPresetChange,
  content,
}: SuiteGeometryTabProps) {
  const radiusOptions = [
    { label: content.defaultPresetName, value: "default" },
    ...Object.keys(allThemeFragments.radii).map((name) => ({
      label: name,
      value: name,
    })),
  ];

  return (
    <div className="p-4">
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
      {/* Aquí irían los controles granulares en una futura versión */}
    </div>
  );
}
