// RUTA: shared/lib/schemas/raz-prompts/prompt-creator.i18n.schema.ts
/**
 * @file prompt-creator.i18n.schema.ts
 * @description SSoT para el contrato de datos del contenido i18n del
 *              componente PromptCreator.
 * @version 3.0.0 (SESA Taxonomy Decoupling)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";

const SesaOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const PromptCreatorContentSchema = z.object({
  titleLabel: z.string(),
  titlePlaceholder: z.string(),
  promptTextLabel: z.string(),
  promptTextPlaceholder: z.string(),
  negativePromptLabel: z.string(),
  negativePromptPlaceholder: z.string(),
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
  }),
  // --- CAMBIO ARQUITECTÓNICO CLAVE ---
  // El schema ya no define las opciones SESA. Solo valida que es un
  // objeto que contendrá arrays de opciones cargadas dinámicamente.
  sesaOptions: z.object({
    ai: z.array(SesaOptionSchema),
    sty: z.array(SesaOptionSchema),
    fmt: z.array(SesaOptionSchema),
    typ: z.array(SesaOptionSchema),
    sbj: z.array(SesaOptionSchema),
  }),
  renderingSpeedLabel: z.string(),
  renderingSpeedPlaceholder: z.string(),
  renderingSpeedOptions: z.array(SesaOptionSchema),
  styleTypeLabel: z.string(),
  styleTypePlaceholder: z.string(),
  styleTypeOptions: z.array(SesaOptionSchema),
  aspectRatioLabel: z.string(),
  aspectRatioPlaceholder: z.string(),
  aspectRatioOptions: z.array(SesaOptionSchema),
  numImagesLabel: z.string(),
  numImagesPlaceholder: z.string(),
  sizeLabel: z.string(),
  sizePlaceholder: z.string(),
  sizeOptions: z.array(SesaOptionSchema),
});

export const PromptCreatorLocaleSchema = z.object({
  promptCreator: PromptCreatorContentSchema.optional(),
});
