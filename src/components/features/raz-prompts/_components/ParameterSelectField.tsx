// RUTA: src/components/features/raz-prompts/_components/ParameterSelectField.tsx
/**
 * @file ParameterSelectField.tsx
 * @description Aparato de presentación hiper-atómico para un campo de selección
 *              de parámetros de IA. Cumple los 7 Pilares de Calidad.
 * @version 2.0.0 (Type Safety & Resilience Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import type { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui";
import type { CreatePromptFormData } from "@/shared/hooks/raz-prompts/use-prompt-creator";
import { logger } from "@/shared/lib/logging";

interface ParameterSelectFieldProps {
  control: Control<CreatePromptFormData>;
  name: keyof CreatePromptFormData["parameters"];
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
}

export function ParameterSelectField({
  control,
  name,
  label,
  placeholder,
  options,
}: ParameterSelectFieldProps): React.ReactElement {
  logger.trace(`[ParameterSelectField] Renderizando para: ${name}`);
  return (
    <FormField
      control={control}
      name={`parameters.${name}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          {/* --- INICIO DE CORRECCIÓN DE TIPO (TS2322) --- */}
          <Select
            onValueChange={field.onChange}
            // Se realiza una coerción explícita y segura a string.
            // Esto maneja valores de tipo string, number, null, o undefined.
            defaultValue={String(field.value ?? "")}
          >
            {/* --- FIN DE CORRECCIÓN DE TIPO --- */}
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
// RUTA: src/components/features/raz-prompts/_components/ParameterSelectField.tsx
