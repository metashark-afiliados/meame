// components/forms/builder/SchemaFieldRenderer/SchemaFieldRenderer.tsx
/**
 * @file SchemaFieldRenderer.tsx
 * @description Orquestador de élite V2. Integra RHF con el motor de renderizado de UI.
 * @version 3.1.0 (Coherent Import Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { z } from "zod";
import type { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "@/components/ui/Form";
import { logger } from "@/shared/lib/logging";
// --- [INICIO DE CORRECCIÓN DE RUTA] ---
import { FieldControl } from "./_components";
// --- [FIN DE CORRECCIÓN DE RUTA] ---

interface SchemaFieldRendererProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  sectionName: string;
  fieldName: Path<TFieldValues>;
  fieldSchema: z.ZodTypeAny;
  onValueChange: (field: Path<TFieldValues>, value: unknown) => void;
}

export function SchemaFieldRenderer<TFieldValues extends FieldValues>({
  control,
  sectionName,
  fieldName,
  fieldSchema,
  onValueChange,
}: SchemaFieldRendererProps<TFieldValues>): React.ReactElement {
  logger.trace(
    `[SchemaFieldRenderer V3.1] Orquestando campo: ${String(fieldName)}`
  );

  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field }) => (
        <FieldControl
          field={field}
          sectionName={sectionName}
          fieldName={fieldName}
          fieldSchema={fieldSchema}
          onValueChange={onValueChange}
        />
      )}
    />
  );
}
// components/forms/builder/SchemaFieldRenderer/SchemaFieldRenderer.tsx
