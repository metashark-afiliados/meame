// RUTA: src/shared/lib/schemas/campaigns/template.schema.ts
/**
 * @file template.schema.ts
 * @description SSoT para el contrato de datos de una plantilla de campaña.
 *              v2.0.0 (Source ID Linkage): Se añade el campo 'sourceCampaignId'
 *              para permitir el rastreo del origen de una plantilla, fortaleciendo
 *              la integridad de los metadatos.
 * @version 2.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { CampaignDraftDataSchema } from "./draft.schema";

export const CampaignTemplateSchema = z.object({
  id: z.string().cuid2({ message: "El ID de la plantilla debe ser un CUID2." }),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string().optional(),
  createdAt: z.date(),
  // --- [INICIO DE REFACTORIZACIÓN DE CONTRATO] ---
  sourceCampaignId: z
    .string()
    .describe(
      "El ID de la campaña base desde la cual se originó esta plantilla."
    ),
  // --- [FIN DE REFACTORIZACIÓN DE CONTRATO] ---
  draftData: CampaignDraftDataSchema,
});

export type CampaignTemplate = z.infer<typeof CampaignTemplateSchema>;
