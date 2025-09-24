// app/[locale]/(dev)/dev/campaign-suite/_components/shared/VariantInputField.tsx
/**
 * @file VariantInputField.tsx
 * @description Componente atómico hiper-especializado para un campo <Input>
 *              dentro de la SDC, encapsulando toda la lógica de react-hook-form.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { FormControl, FormField } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { FormFieldGroup } from "./FormFieldGroup";

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
// app/[locale]/(dev)/dev/campaign-suite/_components/shared/VariantInputField.tsx
