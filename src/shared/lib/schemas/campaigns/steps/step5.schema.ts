// RUTA: src/shared/lib/schemas/campaigns/steps/step5.schema.ts
/**
 * @file step5.schema.ts
 * @description SSoT para el contrato de datos del contenido i18n del Paso 5 de la SDC.
 * @version 2.0.0 (High-Friction Delete Dialog Contract)
 * @author L.I.A. Legacy
 */
import { z } from "zod";

export const Step5ContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  summaryTitle: z.string(),
  summaryPlaceholder: z.string(),
  checklistTitle: z.string(),
  publishButtonText: z.string(),
  packageButtonText: z.string(),
  deleteButtonText: z.string(),
  templateButtonText: z.string(),
  deleteDialog: z.object({
    title: z.string(),
    description: z.string(),
    cancelButton: z.string(),
    confirmButton: z.string(),
    // --- [INICIO DE REFACTORIZACIÓN DE CONTRATO] ---
    // Se añaden las claves para la UX de alta fricción.
    draftNameLabel: z.string(),
    confirmationTextLabel: z.string(),
    confirmationTextPlaceholder: z.string(),
    // --- [FIN DE REFACTORIZACIÓN DE CONTRATO] ---
  }),
  templateDialog: z.object({
    title: z.string(),
    description: z.string(),
    nameLabel: z.string(),
    namePlaceholder: z.string(),
    descriptionLabel: z.string(),
    descriptionPlaceholder: z.string(),
    saveButton: z.string(),
    cancelButton: z.string(),
  }),
});
