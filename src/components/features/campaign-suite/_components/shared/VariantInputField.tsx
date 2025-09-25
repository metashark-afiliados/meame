// RUTA: src/components/features/campaign-suite/_components/shared/VariantInputField.tsx
/**
 * @file VariantInputField.tsx
 * @description Componente atómico hiper-especializado para un campo <Input>.
 * @version 2.0.0 (Sovereign Path Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { FormControl, FormField } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { FormFieldGroup } from "@/components/forms/FormFieldGroup"; // <-- RUTA CORREGIDA

interface VariantInputFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder: string;
  description?: string;
}

export function VariantInputField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
}: VariantInputFieldProps<TFieldValues>): React.ReactElement {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormFieldGroup label={label} description={description}>
          <FormControl>
            <Input placeholder={placeholder} {...field} />
          </FormControl>
        </FormFieldGroup>
      )}
    />
  );
}
