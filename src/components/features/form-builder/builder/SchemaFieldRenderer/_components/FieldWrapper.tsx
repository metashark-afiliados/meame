// RUTA: src/components/features/form-builder/builder/SchemaFieldRenderer/_components/FieldWrapper.tsx
/**
 * @file FieldWrapper.tsx
 * @description Componente de envoltura de alto orden para campos de formulario.
 * @version 3.0.0 (Sovereign Path Restoration)
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
// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
import { useFocusStore } from "@/components/features/campaign-suite/_context/FocusContext";
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---
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
