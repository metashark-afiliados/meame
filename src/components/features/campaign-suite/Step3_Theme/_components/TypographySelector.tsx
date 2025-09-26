// RUTA: src/components/features/campaign-suite/Step3_Theme/_components/PaletteSelector.tsx
/**
 * @file PaletteSelector.tsx
 * @description Aparato de UI atómico y de élite para la selección visual de paletas de colores.
 * @version 1.1.0 (Architectural Realignment)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils/cn";
import { DynamicIcon } from "@/components/ui";
import { logger } from "@/shared/lib/logging";

/**
 * @interface Palette
 * @description Contrato de datos para una única paleta de colores.
 */
interface Palette {
  name: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    foreground?: string;
  };
}

interface PaletteSelectorProps {
  palettes: Palette[];
  selectedPaletteName: string | null;
  onSelect: (paletteName: string) => void;
  onPreview: (palette: Palette | null) => void;
  onCreate: () => void;
  createNewPaletteButton: string;
}

const PaletteSwatch = ({ color }: { color: string }) => (
  <div className="h-full w-full" style={{ backgroundColor: `hsl(${color})` }} />
);

export function PaletteSelector({
  palettes,
  selectedPaletteName,
  onSelect,
  onPreview,
  onCreate,
  createNewPaletteButton,
}: PaletteSelectorProps) {
  logger.trace("[PaletteSelector] Renderizando selector visual de paletas.");
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {palettes.map((palette) => {
        const colors = palette.colors ?? {};
        return (
          <motion.div
            key={palette.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => onPreview(palette)}
            onMouseLeave={() => onPreview(null)}
            onClick={() => onSelect(palette.name)}
            className={cn(
              "cursor-pointer rounded-lg border-2 p-2 transition-all duration-200 hover:scale-105 hover:shadow-xl",
              selectedPaletteName === palette.name
                ? "border-primary ring-2 ring-primary/50"
                : "border-muted/50"
            )}
          >
            <div className="h-20 w-full flex overflow-hidden rounded-md">
              <PaletteSwatch color={colors.primary ?? "0 0% 100%"} />
              <PaletteSwatch color={colors.secondary ?? "0 0% 100%"} />
              <PaletteSwatch color={colors.accent ?? "0 0% 100%"} />
              <PaletteSwatch color={colors.background ?? "0 0% 100%"} />
              <PaletteSwatch color={colors.foreground ?? "0 0% 0%"} />
            </div>
            <p className="mt-2 text-center text-sm font-semibold text-foreground">
              {palette.name}
            </p>
          </motion.div>
        );
      })}
      <button
        onClick={onCreate}
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted/50 p-2 transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:text-primary"
      >
        <DynamicIcon name="Plus" className="h-8 w-8 mb-2" />
        <span className="text-sm font-semibold">{createNewPaletteButton}</span>
      </button>
    </div>
  );
}
