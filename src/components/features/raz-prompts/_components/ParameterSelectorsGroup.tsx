// RUTA: src/components/features/raz-prompts/_components/ParameterSelectorsGroup.tsx
/**
 * @file ParameterSelectorsGroup.tsx
 * @description Orquestador de presentación para los parámetros de la IA.
 *              v3.0.0 (Hyper-Atomization & MEA/UX): Refactorizado a un orquestador
 *              puro que compone aparatos atómicos y añade animación de entrada.
 * @version 3.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import type { Control } from "react-hook-form";
import { motion, type Variants } from "framer-motion";
import { FormFieldGroup } from "@/components/forms/FormFieldGroup";
import type { CreatePromptFormData } from "@/shared/hooks/raz-prompts/use-prompt-creator";
import type { PromptCreatorContentSchema } from "@/shared/lib/schemas/raz-prompts/prompt-creator.i18n.schema";
import type { z } from "zod";
import { logger } from "@/shared/lib/logging";
import { ParameterSelectField } from "./ParameterSelectField";
import { ParameterInputField } from "./ParameterInputField";

type Content = z.infer<typeof PromptCreatorContentSchema>;

interface ParameterSelectorsGroupProps {
  control: Control<CreatePromptFormData>;
  content: Content;
}

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export function ParameterSelectorsGroup({
  control,
  content,
}: ParameterSelectorsGroupProps) {
  logger.trace("[ParameterSelectorsGroup] Renderizando orquestador v3.0.");
  return (
    <FormFieldGroup label={content.parametersGroupLabel} className="space-y-4">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      >
        <motion.div variants={fieldVariants}>
          <ParameterSelectField
            control={control}
            name="renderingSpeed"
            label={content.renderingSpeedLabel}
            placeholder={content.renderingSpeedPlaceholder}
            options={content.renderingSpeedOptions}
          />
        </motion.div>
        <motion.div variants={fieldVariants}>
          <ParameterSelectField
            control={control}
            name="styleType"
            label={content.styleTypeLabel}
            placeholder={content.styleTypePlaceholder}
            options={content.styleTypeOptions}
          />
        </motion.div>
        <motion.div variants={fieldVariants}>
          <ParameterSelectField
            control={control}
            name="aspectRatio"
            label={content.aspectRatioLabel}
            placeholder={content.aspectRatioPlaceholder}
            options={content.aspectRatioOptions}
          />
        </motion.div>
        <motion.div variants={fieldVariants}>
          <ParameterInputField
            control={control}
            name="numImages"
            label={content.numImagesLabel}
            placeholder={content.numImagesPlaceholder}
          />
        </motion.div>
        <motion.div variants={fieldVariants} className="md:col-span-2">
          <ParameterSelectField
            control={control}
            name="size"
            label={content.sizeLabel}
            placeholder={content.sizePlaceholder}
            options={content.sizeOptions}
          />
        </motion.div>
      </motion.div>
    </FormFieldGroup>
  );
}
// RUTA: src/components/features/raz-prompts/_components/ParameterSelectorsGroup.tsx
