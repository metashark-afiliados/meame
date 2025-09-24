// app/[locale]/(dev)/raz-prompts/_components/SesaTagsFormGroup.tsx
/**
 * @file SesaTagsFormGroup.tsx
 * @description Aparato de presentación atómico para el grupo de selectores de SESA.
 * @version 3.0.0 (Generic Form Integration): Refactorizado para ser compatible
 *              con cualquier formulario de react-hook-form que contenga un
 *              campo anidado 'sesaTags', resolviendo el error de tipo TS2322.
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";
import React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
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
import {
  RaZPromptsSesaTagsSchema,
  type RaZPromptsSesaTags,
} from "@/shared/lib/schemas/raz-prompts/atomic.schema";
import type { PromptCreatorContentSchema } from "@/shared/lib/schemas/raz-prompts/prompt-creator.i18n.schema";
import { logger } from "@/shared/lib/logging";
import type { z } from "zod";

type SesaContent = Pick<
  z.infer<typeof PromptCreatorContentSchema>,
  "sesaLabels" | "sesaOptions"
>;

// --- [INICIO] REFACTORIZACIÓN DE TIPO ---
// Ahora acepta cualquier `FieldValues` como genérico.
interface SesaTagsFormGroupProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  content: {
    [K in keyof SesaContent["sesaLabels"]]: string;
  } & {
    options: SesaContent["sesaOptions"];
  };
}
// --- [FIN] REFACTORIZACIÓN DE TIPO ---

const sesaFields: (keyof RaZPromptsSesaTags)[] = Object.keys(
  RaZPromptsSesaTagsSchema.shape
) as (keyof RaZPromptsSesaTags)[];

export function SesaTagsFormGroup<TFieldValues extends FieldValues>({
  control,
  content,
}: SesaTagsFormGroupProps<TFieldValues>) {
  logger.trace("[SesaTagsFormGroup] Renderizando grupo de tags SESA v3.0.");

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {sesaFields.map((tagName) => (
        <FormField
          key={tagName}
          control={control}
          // --- [INICIO] REFACTORIZACIÓN DE RUTA DE CAMPO ---
          // El 'name' ahora apunta al campo anidado 'sesaTags'.
          name={`sesaTags.${tagName}` as Path<TFieldValues>}
          // --- [FIN] REFACTORIZACIÓN DE RUTA DE CAMPO ---
          render={({ field }) => (
            <FormItem>
              <FormLabel>{content[tagName]}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {content.options[tagName].map((option) => (
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
      ))}
    </div>
  );
}
// app/[locale]/(dev)/raz-prompts/_components/SesaTagsFormGroup.tsx
