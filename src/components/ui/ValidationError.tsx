// RUTA: components/ui/ValidationError.tsx
/**
 * @file ValidationError.tsx
 * @description Componente de UI de élite, exclusivo para desarrollo, que muestra
 *              errores de validación de Zod de forma clara e internacionalizada.
 * @version 2.0.0 (Holistic Elite Leveling & MEA)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client"; // Necesario para el <details> interactivo

import React from "react";
import { type ZodError } from "zod";
import { motion } from "framer-motion";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

type ValidationErrorContent = NonNullable<Dictionary["validationError"]>;

interface ValidationErrorProps {
  sectionName: string;
  error: ZodError;
  content: ValidationErrorContent;
}

export function ValidationError({
  sectionName,
  error,
  content,
}: ValidationErrorProps): React.ReactElement | null {
  logger.error(
    `[ValidationError] Error de validación de datos para la sección: ${sectionName}`,
    { validationErrors: error.flatten().fieldErrors }
  );

  // Este componente solo se renderiza en desarrollo.
  if (process.env.NODE_ENV !== "production") {
    const title = content.title.replace("{{sectionName}}", sectionName);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="container my-12"
      >
        <div className="border-2 border-dashed border-destructive rounded-lg bg-destructive/5 p-6 text-destructive">
          <div className="flex items-start gap-4">
            <DynamicIcon
              name="TriangleAlert"
              className="h-8 w-8 mt-1 flex-shrink-0"
            />
            <div>
              <h3 className="font-bold text-lg text-destructive-foreground">
                {title}
              </h3>
              <p className="text-sm mt-1 text-destructive-foreground/90">
                {content.description}
              </p>
              <details className="mt-3 text-xs group">
                <summary className="cursor-pointer font-medium text-destructive-foreground/70 hover:text-destructive-foreground list-none flex items-center gap-1">
                  <DynamicIcon
                    name="ChevronRight"
                    className="h-4 w-4 transition-transform duration-200 group-open:rotate-90"
                  />
                  {content.detailsLabel}
                </summary>
                <pre className="mt-2 p-3 bg-black/30 rounded-md whitespace-pre-wrap font-mono">
                  {JSON.stringify(error.flatten().fieldErrors, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}
