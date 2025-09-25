// RUTA: src/components/features/campaign-suite/_components/shared/CampaignSelectField.tsx
/**
 * @file CampaignSelectField.tsx
 * @description Componente atómico hiper-especializado para un campo <Select>.
 * @version 2.0.0 (Sovereign Path Restoration)
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
import { FormFieldGroup } from "@/components/forms/FormFieldGroup"; // <-- RUTA CORREGIDA

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
