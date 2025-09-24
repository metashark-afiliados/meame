// app/[locale]/(dev)/dev/campaign-suite/_components/shared/CampaignSelectField.tsx
/**
 * @file CampaignSelectField.tsx
 * @description Componente atómico hiper-especializado para un campo <Select>
 *              dentro de la SDC, encapsulando toda la lógica de react-hook-form.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { FormControl, FormField } from "@/components/ui/Form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { FormFieldGroup } from "./FormFieldGroup";

interface CampaignSelectFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder: string;
  description?: string;
  options: { value: string; label: string }[];
}

export function CampaignSelectField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  options,
}: CampaignSelectFieldProps<TFieldValues>): React.ReactElement {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormFieldGroup label={label} description={description}>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormFieldGroup>
      )}
    />
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_components/shared/CampaignSelectField.tsx
