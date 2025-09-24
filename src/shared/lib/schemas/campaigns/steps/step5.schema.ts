// RUTA: shared/lib/schemas/campaigns/steps/step5.schema.ts
/**
 * @file step5.schema.ts
 * @description SSoT para el contrato de datos del contenido i18n del Paso 5 de la SDC.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
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
