// RUTA: src/shared/lib/schemas/pages/cogniread-editor.schema.ts
/**
 * @file cogniread-editor.schema.ts
 * @description SSoT para el contrato de datos i18n de la página del editor de artículos de CogniRead.
 * @version 2.0.0 (Resilience Key Added)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";

export const CogniReadEditorContentSchema = z.object({
  pageHeader: z.object({
    createTitle: z.string(),
    createSubtitle: z.string(),
    editTitle: z.string(),
    editSubtitle: z.string(),
  }),
  tabs: z.object({
    dna: z.string(),
    content: z.string(),
    ecosystem: z.string(),
  }),
  contentTab: z.object({
    titleLabel: z.string(),
    titlePlaceholder: z.string(),
    slugLabel: z.string(),
    slugPlaceholder: z.string(),
    summaryLabel: z.string(),
    summaryPlaceholder: z.string(),
    bodyLabel: z.string(),
    bodyPlaceholder: z.string(),
  }),
  ecosystemTab: z.object({
    heroImageTitle: z.string(),
    heroImageDescription: z.string(),
    noImageSelected: z.string(),
    selectFromBaviButton: z.string(),
    loadingBaviButton: z.string(),
    relatedPromptsTitle: z.string(),
    relatedPromptsDescription: z.string(),
  }),
  saveButton: z.string(),
  saveButtonLoading: z.string(),
  // --- [INICIO DE REFACTORIZACIÓN DE CONTRATO] ---
  articleNotFoundError: z.string(), // Clave de resiliencia añadida.
  // --- [FIN DE REFACTORIZACIÓN DE CONTRATO] ---
});

export const CogniReadEditorLocaleSchema = z.object({
  cogniReadEditor: CogniReadEditorContentSchema.optional(),
});
