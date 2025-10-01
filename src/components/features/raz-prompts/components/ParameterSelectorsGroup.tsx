// RUTA: src/components/features/raz-prompts/components/ParameterSelectorsGroup.tsx
/**
 * @file ParameterSelectorsGroup.tsx
 * @description Orquestador de presentación data-driven para los parámetros de la IA,
 *              forjado con MEA/UX y observabilidad de élite.
 * @version 5.0.0 (Holistic Contract Alignment)
 *@author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import type { Control } from "react-hook-form";
import { motion, type Variants } from "framer-motion";
import { FormFieldGroup } from "@/components/forms/FormFieldGroup";
import type { CreatePromptFormData } from "@/shared/hooks/raz-prompts/use-prompt-creator";
import type { z } from "zod";
import { logger } from "@/shared/lib/logging";
import { ParameterSelectField } from "./ParameterSelectField";
import { IDEOGRAM_PARAMETERS_CONFIG } from "@/shared/lib/config/raz-prompts/parameters.config";
import type { PromptCreatorContentSchema } from "@/shared/lib/schemas/raz-prompts/prompt-creator.i18n.schema";
import { DeveloperErrorDisplay } from "../../dev-tools";

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
  const traceId = logger.startTrace("ParameterSelectorsGroup_Render_v5.0");
  logger.info(
    "[ParameterSelectorsGroup] Renderizando orquestador data-driven.",
    { traceId }
  );

  // --- GUARDIÁN DE CONTRATO ---
  if (!content || !content.parameterOptions || !content.sesaLabels) {
    const errorMsg =
      "Contrato de UI violado: Faltan datos de i18n para los parámetros.";
    logger.error(`[Guardián] ${errorMsg}`, { traceId });
    logger.endTrace(traceId);
    return (
      <DeveloperErrorDisplay
        context="ParameterSelectorsGroup"
        errorMessage={errorMsg}
      />
    );
  }

  logger.endTrace(traceId);
  return (
    <FormFieldGroup label={content.parametersGroupLabel} className="space-y-4">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        initial="hidden"
        animate="visible"
      >
        {IDEOGRAM_PARAMETERS_CONFIG.map((config) => {
          // --- [INICIO DE REFACTORIZACIÓN DE LÓGICA] ---
          // La lógica ahora es segura a nivel de tipos y consume el schema correcto.
          const options = content.parameterOptions[config.id] || [];
          return (
            <motion.div key={config.id} variants={fieldVariants}>
              <ParameterSelectField
                control={control}
                name={`parameters.${config.id}`} // <-- Ahora es seguro a nivel de tipos gracias al Path<T>
                label={
                  content.sesaLabels[
                    config.labelKey as keyof typeof content.sesaLabels
                  ]
                }
                placeholder={
                  content.sesaLabels[
                    config.placeholderKey as keyof typeof content.sesaLabels
                  ]
                }
                options={options}
              />
            </motion.div>
          );
          // --- [FIN DE REFACTORIZACIÓN DE LÓGICA] ---
        })}
      </motion.div>
    </FormFieldGroup>
  );
}
