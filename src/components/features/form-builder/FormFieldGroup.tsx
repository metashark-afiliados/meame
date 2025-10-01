// RUTA: src/components/features/form-builder/FormFieldGroup.tsx
/**
 * @file FormFieldGroup.tsx
 * @description Componente de layout atómico para agrupar elementos de un campo de formulario.
 *              v3.0.0 (Sovereign Architectural Elevation & Elite Compliance): Elevado a su
 *              dominio canónico en form-builder y nivelado con los 8 Pilares de Calidad.
 * @version 3.0.0
 *@author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import {
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/Form";
import { cn } from "@/shared/lib/utils/cn";
import { logger } from "@/shared/lib/logging";

interface FormFieldGroupProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormFieldGroup({
  label,
  description,
  children,
  className,
}: FormFieldGroupProps): React.ReactElement {
  logger.trace(`[FormFieldGroup] Renderizando grupo para: "${label}"`);

  return (
    <FormItem className={cn("space-y-3", className)}>
      <FormLabel>{label}</FormLabel>
      {children}
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}
