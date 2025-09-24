// RUTA: components/forms/builder/SchemaFieldRenderer/_components/FieldControl.tsx
/**
 * @file FieldControl.tsx
 * @description Componente despachador puro.
 *              v4.0.0 (Absolute Path Compliance): Se alinea con la Directiva 013
 *              utilizando rutas de importación absolutas, mejorando la resiliencia
 *              y mantenibilidad del aparato.
 * @version 4.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import type { FieldValues } from "react-hook-form";
import { logger } from "@/shared/lib/logging";
// --- [INICIO DE REFACTORIZACIÓN DE RUTA] ---
import type { FieldComponentProps } from "@/components/features/form-builder/builder/SchemaFieldRenderer/_types/field.types";
import { useFieldMetadata } from "@/components/forms/builder/SchemaFieldRenderer/_hooks/use-field-metadata";
// --- [FIN DE REFACTORIZACIÓN DE RUTA] ---
import { FieldWrapper } from "./FieldWrapper";
import * as Fields from "./fields";

interface FieldControlProps<TFieldValues extends FieldValues>
  extends FieldComponentProps<TFieldValues> {
  sectionName: string;
}

export function FieldControl<TFieldValues extends FieldValues>({
  field,
  sectionName,
  fieldName,
  fieldSchema,
  onValueChange,
}: FieldControlProps<TFieldValues>): React.ReactElement {
  const metadata = useFieldMetadata(fieldSchema, String(fieldName));
  logger.trace(
    `[FieldControl] Despachando campo '${String(
      fieldName
    )}' con control: ${metadata.controlType}`
  );

  const renderField = () => {
    const props = { field, fieldSchema, onValueChange, fieldName };
    switch (metadata.controlType) {
      case "switch":
        return <Fields.BooleanField {...props} />;
      case "select":
        return (
          <Fields.EnumField {...props} placeholder={metadata.placeholder} />
        );
      case "image":
        return <Fields.ImageField {...props} />;
      case "input":
      default:
        return (
          <Fields.StringField {...props} placeholder={metadata.placeholder} />
        );
    }
  };

  return (
    <FieldWrapper
      metadata={metadata}
      sectionName={sectionName}
      fieldName={String(fieldName)}
    >
      {renderField()}
    </FieldWrapper>
  );
}
