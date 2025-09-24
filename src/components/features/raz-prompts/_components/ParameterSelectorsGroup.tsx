// RUTA: app/[locale]/(dev)/raz-prompts/_components/ParameterSelectorsGroup.tsx
/**
 * @file ParameterSelectorsGroup.tsx
 * @description Aparato de presentación atómico y soberano. Su única responsabilidad
 *              es renderizar el grupo de controles de formulario para los parámetros
 *              de generación de imágenes de la IA.
 * @version 1.0.0 (Elite & Atomic)
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
  Input,
} from "@/components/ui";
import { FormFieldGroup } from "@/app/[locale]/(dev)/dev/campaign-suite/_components/shared/FormFieldGroup";
import type { CreatePromptFormData } from "@/shared/hooks/raz-prompts/use-prompt-creator";
import type { PromptCreatorContentSchema } from "@/shared/lib/schemas/raz-prompts/prompt-creator.i18n.schema";
import type { z } from "zod";
import { logger } from "@/shared/lib/logging";

// --- SSoT de Tipos ---
type Content = z.infer<typeof PromptCreatorContentSchema>;

/**
 * @interface ParameterSelectorsGroupProps
 * @description Contrato de props para el grupo de selectores de parámetros.
 *              Es 100% data-driven y se acopla a react-hook-form.
 */
interface ParameterSelectorsGroupProps {
  control: Control<CreatePromptFormData>;
  content: Content;
}

/**
 * @component ParameterSelectorsGroup
 * @description Renderiza la sección del formulario dedicada a los parámetros de la IA.
 * @param {ParameterSelectorsGroupProps} props - Las props del componente.
 * @returns {React.ReactElement}
 */
export function ParameterSelectorsGroup({
  control,
  content,
}: ParameterSelectorsGroupProps) {
  logger.trace("[ParameterSelectorsGroup] Renderizando aparato atómico.");
  return (
    <FormFieldGroup label={content.parametersGroupLabel} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rendering Speed */}
        <FormField
          control={control}
          name="parameters.renderingSpeed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{content.renderingSpeedLabel}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={content.renderingSpeedPlaceholder}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {content.renderingSpeedOptions.map((option) => (
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
        {/* Style Type */}
        <FormField
          control={control}
          name="parameters.styleType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{content.styleTypeLabel}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={content.styleTypePlaceholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {content.styleTypeOptions.map((option) => (
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
        {/* Aspect Ratio */}
        <FormField
          control={control}
          name="parameters.aspectRatio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{content.aspectRatioLabel}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={content.aspectRatioPlaceholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {content.aspectRatioOptions.map((option) => (
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
        {/* Num Images */}
        <FormField
          control={control}
          name="parameters.numImages"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{content.numImagesLabel}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={content.numImagesPlaceholder}
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Size */}
        <FormField
          control={control}
          name="parameters.size"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>{content.sizeLabel}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={content.sizePlaceholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {content.sizeOptions.map((option) => (
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
      </div>
    </FormFieldGroup>
  );
}
