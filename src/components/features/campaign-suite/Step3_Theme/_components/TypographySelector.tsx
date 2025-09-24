// app/[locale]/(dev)/dev/campaign-suite/_components/Step3_Theme/_components/TypographySelector.tsx
/**
 * @file TypographySelector.tsx
 * @description Aparato de UI atómico y de élite para la selección visual de tipografías.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils/cn";
import { DynamicIcon } from "@/components/ui";
import { logger } from "@/shared/lib/logging";

/**
 * @interface Typography
 * @description Contrato de datos para una única combinación de tipografías.
 */
interface Typography {
  name: string;
  fonts?: {
    sans?: string;
    serif?: string;
  };
}

/**
 * @interface TypographySelectorProps
 * @description Contrato de props para el componente TypographySelector.
 */
interface TypographySelectorProps {
  typographies: Typography[];
  selectedTypographyName: string | null;
  onSelect: (typographyName: string) => void;
  onPreview: (typography: Typography | null) => void;
  onCreate: () => void;
  emptyPlaceholder: string;
  createNewFontSetButton: string;
}

export function TypographySelector({
  typographies,
  selectedTypographyName,
  onSelect,
  onPreview,
  onCreate,
  emptyPlaceholder,
  createNewFontSetButton,
}: TypographySelectorProps): React.ReactElement {
  logger.trace("[TypographySelector] Renderizando selector de tipografía.");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {typographies.length === 0 && (
        <div className="lg:col-span-3 text-center py-8 text-muted-foreground">
          <DynamicIcon name="Type" className="h-10 w-10 mx-auto mb-3" />
          <p>{emptyPlaceholder}</p>
        </div>
      )}
      {typographies.map((typography) => {
        const fonts = typography.fonts ?? {};
        return (
          <motion.div
            key={typography.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => onPreview(typography)}
            onMouseLeave={() => onPreview(null)}
            onClick={() => onSelect(typography.name)}
            className={cn(
              "cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:scale-105 hover:shadow-xl",
              selectedTypographyName === typography.name
                ? "border-primary ring-2 ring-primary/50"
                : "border-muted/50"
            )}
          >
            <div className="h-20 w-full flex flex-col items-center justify-center rounded-md bg-muted/20 p-2">
              {fonts.sans && (
                <p
                  className="text-lg font-bold text-foreground overflow-hidden whitespace-nowrap"
                  style={{ fontFamily: fonts.sans.split(",")[0] }}
                >
                  {typography.name}
                </p>
              )}
              {fonts.serif && (
                <p
                  className="text-sm italic text-muted-foreground overflow-hidden whitespace-nowrap"
                  style={{ fontFamily: fonts.serif.split(",")[0] }}
                >
                  Serif Example
                </p>
              )}
              {!fonts.sans && !fonts.serif && (
                <p className="text-sm text-muted-foreground">No Preview</p>
              )}
            </div>
            <p className="mt-2 text-center text-sm font-semibold text-foreground">
              {typography.name}
            </p>
          </motion.div>
        );
      })}
      <button
        onClick={onCreate}
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted/50 p-4 transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:text-primary"
      >
        <DynamicIcon name="Plus" className="h-8 w-8 mb-2" />
        <span className="text-sm font-semibold">
          {typographies.length === 0
            ? "Añadir Nuevo Set"
            : createNewFontSetButton}
        </span>
      </button>
    </div>
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_components/Step3_Theme/_components/TypographySelector.tsx
