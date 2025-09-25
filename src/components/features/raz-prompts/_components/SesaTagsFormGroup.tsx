// RUTA: src/components/features/raz-prompts/_components/SesaTagsFormGroup.tsx
/**
 * @file SesaTagsFormGroup.tsx
 * @description Aparato de presentación atómico para el grupo de selectores de SESA.
 * @version 3.1.0 (Sovereign Path Restoration)
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
// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
import { FormFieldGroup } from "@/components/forms/FormFieldGroup";
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---

type SesaContent = Pick<
  z.infer<typeof PromptCreatorContentSchema>,
  "sesaLabels" | "sesaOptions"
>;

interface SesaTagsFormGroupProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  content: {
    [K in keyof SesaContent["sesaLabels"]]: string;
  } & {
    options: SesaContent["sesaOptions"];
  };
}

const sesaFields: (keyof RaZPromptsSesaTags)[] = Object.keys(
  RaZPromptsSesaTagsSchema.shape
) as (keyof RaZPromptsSesaTags)[];

export function SesaTagsFormGroup<TFieldValues extends FieldValues>({
  control,
  content,
}: SesaTagsFormGroupProps<TFieldValues>) {
  logger.trace("[SesaTagsFormGroup] Renderizando grupo de tags SESA v3.1.");

  return (
    <FormFieldGroup label={content.tagsGroupLabel}>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {sesaFields.map((tagName) => (
          <FormField
            key={tagName}
            control={control}
            name={`sesaTags.${tagName}` as Path<TFieldValues>}
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
    </FormFieldGroup>
  );
}
