// RUTA: src/components/features/dev-tools/SuiteStyleComposer/_components/SuiteColorsTab.tsx
/**
 * @file SuiteColorsTab.tsx
 * @description Aparato atómico para la selección visual de paletas de colores.
 * @version 3.0.0 (Type & Path Integrity Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { LoadedFragments } from "./types";
import type { AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";

interface SuiteColorsTabProps {
  allThemeFragments: LoadedFragments;
  selectedColorPreset: string;
  onColorPresetChange: (value: string) => void;
  content: {
    selectThemeLabel: string;
    defaultPresetName: string;
  };
}

const PaletteSwatch = ({ color }: { color?: string }) => (
  <div
    className="h-full w-full"
    style={{ backgroundColor: color ? `hsl(${color})` : "transparent" }}
  />
);

export function SuiteColorsTab({
  allThemeFragments,
  selectedColorPreset,
  onColorPresetChange,
  content,
}: SuiteColorsTabProps) {
  // --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: ASERCIÓN DE TIPO] ---
  const palettes = (
    Object.entries(allThemeFragments.colors) as [
      string,
      Partial<AssembledTheme>,
    ][]
  ).map(([name, data]) => ({
    name,
    colors: data.colors ?? {},
  }));
  // --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

  return (
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-4">{content.selectThemeLabel}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {palettes.map((palette) => (
          <motion.div
            key={palette.name}
            onClick={() => onColorPresetChange(palette.name)}
            whileHover={{ scale: 1.05 }}
            className={cn(
              "cursor-pointer rounded-lg border-2 p-2 transition-all duration-200 hover:shadow-xl",
              selectedColorPreset === palette.name
                ? "border-primary ring-2 ring-primary/50"
                : "border-muted/50"
            )}
          >
            <div className="h-20 w-full flex overflow-hidden rounded-md border">
              <PaletteSwatch color={palette.colors.primary} />
              <PaletteSwatch color={palette.colors.secondary} />
              <PaletteSwatch color={palette.colors.accent} />
              <PaletteSwatch color={palette.colors.background} />
              <PaletteSwatch color={palette.colors.foreground} />
            </div>
            <p className="mt-2 text-center text-sm font-semibold text-foreground capitalize">
              {palette.name}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
