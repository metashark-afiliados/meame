// RUTA: src/components/features/form-builder/builder/SchemaFieldRenderer/_components/FieldWrapper.tsx
/**
 * @file FieldWrapper.tsx
 * @description Componente de envoltura de alto orden para campos de formulario.
 *              v3.0.0 (Sovereign Path Restoration & Focus-Aware): Ahora actúa
 *              como el "sensor" del Modo Enfoque, comunicando los eventos de
 *              foco al store de Zustand global.
 * @version 3.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/Form";
import { useFocusStore } from "@/components/features/campaign-suite/_context/FocusContext";
import { logger } from "@/shared/lib/logging";
import { cn } from "@/shared/lib/utils/cn";
import type { FieldMetadata } from "../_types/field.types";

interface FieldWrapperProps {
  children: React.ReactNode;
  metadata: FieldMetadata;
  sectionName: string;
  fieldName: string;
}

export function FieldWrapper({
  children,
  metadata,
  sectionName,
  fieldName,
}: FieldWrapperProps): React.ReactElement {
  logger.trace(`[FieldWrapper] Envolviendo campo: ${fieldName}`);
  const { setFocus, clearFocus } = useFocusStore();

  return (
    <FormItem
      onFocus={() => setFocus(sectionName, fieldName)}
      onBlur={clearFocus}
      className="group"
    >
      <FormLabel
        className={cn(
          "transition-colors duration-200",
          "group-focus-within:text-primary"
        )}
      >
        {metadata.label}
      </FormLabel>
      {metadata.description && (
        <FormDescription>{metadata.description}</FormDescription>
      )}
      <FormControl>{children}</FormControl>
      <FormMessage />
    </FormItem>
  );
}
