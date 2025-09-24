// app/[locale]/(dev)/dev/campaign-suite/_components/shared/FormFieldGroup.tsx
/**
 * @file FormFieldGroup.tsx
 * @description Componente de layout atómico y reutilizable para agrupar
 *              elementos de un campo de formulario de manera consistente.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
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
  children: React.ReactNode; // Para pasar el <FormControl>
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
// app/[locale]/(dev)/dev/campaign-suite/_components/shared/FormFieldGroup.tsx
