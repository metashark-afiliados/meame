// RUTA: src/shared/lib/schemas/raz-prompts/prompt-creator.i18n.schema.ts
/**
 * @file prompt-creator.i18n.schema.ts
 * @description SSoT para el contrato de datos del contenido i18n del
 *              componente PromptCreator.
 * @version 4.0.0 (Data-Driven Parameter Options)
 *@author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";

const SesaOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const PromptCreatorContentSchema = z.object({
  titleLabel: z.string(),
  titlePlaceholder: z.string(),
  formDescription: z.string(),
  promptTextLabel: z.string(),
  promptTextPlaceholder: z.string(),
  enhanceAILabel: z.string(),
  enhanceAIDescription: z.string(),
  tagsGroupLabel: z.string(),
  parametersGroupLabel: z.string(),
  keywordsLabel: z.string(),
  keywordsPlaceholder: z.string(),
  keywordsDescription: z.string(),
  submitButtonText: z.string(),
  submitButtonLoadingText: z.string(),
  sesaLabels: z.object({
    ai: z.string(),
    sty: z.string(),
    fmt: z.string(),
    typ: z.string(),
    sbj: z.string(),
    // Labels para los nuevos selectores de parámetros
    styleTypeLabel: z.string(),
    styleTypePlaceholder: z.string(),
    aspectRatioLabel: z.string(),
    aspectRatioPlaceholder: z.string(),
  }),
  sesaOptions: z.object({
    ai: z.array(SesaOptionSchema),
    sty: z.array(SesaOptionSchema),
    fmt: z.array(SesaOptionSchema),
    typ: z.array(SesaOptionSchema),
    sbj: z.array(SesaOptionSchema),
  }),
  // --- [INICIO DE REFACTORIZACIÓN DE CONTRATO] ---
  // Las opciones de los parámetros ahora están agrupadas para un consumo data-driven.
  parameterOptions: z.object({
    styleType: z.array(SesaOptionSchema),
    aspectRatio: z.array(SesaOptionSchema),
  }),
  // --- [FIN DE REFACTORIZACIÓN DE CONTRATO] ---
});

export const PromptCreatorLocaleSchema = z.object({
  promptCreator: PromptCreatorContentSchema.optional(),
});
