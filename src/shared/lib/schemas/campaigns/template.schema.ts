// RUTA: shared/lib/schemas/campaigns/template.schema.ts
/**
 * @file template.schema.ts
 * @description SSoT para el contrato de datos de una plantilla de campaña.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { CampaignDraftDataSchema } from "./draft.schema";

export const CampaignTemplateSchema = z.object({
  id: z.string(), // ID de la plantilla en la base de datos (ej. MongoDB ObjectId)
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string().optional(),
  createdAt: z.date(),
  // El corazón de la plantilla: una copia completa y validada del borrador.
  draftData: CampaignDraftDataSchema,
});

export type CampaignTemplate = z.infer<typeof CampaignTemplateSchema>;
