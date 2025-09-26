// RUTA: src/components/features/form-builder/builder/SchemaFieldRenderer/_components/FieldControl.tsx
/**
 * @file FieldControl.tsx
 * @description Componente despachador puro.
 *              v5.0.0 (Holistic Path Restoration): Se restaura la integridad de
 *              las rutas de importación para alinearse con la arquitectura
 *              soberana, resolviendo un error crítico de build.
 * @version 5.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import type { FieldValues } from "react-hook-form";
import { logger } from "@/shared/lib/logging";
import type { FieldComponentProps } from "../_types/field.types";
// --- [INICIO DE REFACTORIZACIÓN DE RUTA] ---
// La ruta ahora es relativa y apunta correctamente al hook co-ubicado.
import { useFieldMetadata } from "../_hooks/use-field-metadata";
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
