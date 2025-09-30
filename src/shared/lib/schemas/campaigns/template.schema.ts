// RUTA: src/shared/lib/schemas/campaigns/template.schema.ts
/**
 * @file template.schema.ts
 * @description SSoT para el contrato de datos de una plantilla de campaña.
 * @version 3.0.0 (CamelCase Convention & Elite Compliance)
 * @author L.I.A. Legacy
 */
import { z } from "zod";
import { CampaignDraftDataSchema } from "./draft.schema";

export const CampaignTemplateSchema = z.object({
  id: z.string().cuid2({ message: "El ID de la plantilla debe ser un CUID2." }),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string().optional(),
  // SSoT: la propiedad en nuestro codebase es camelCase.
  createdAt: z.date().describe("La fecha de creación de la plantilla."),
  sourceCampaignId: z
    .string()
    .describe(
      "El ID de la campaña base desde la cual se originó esta plantilla."
    ),
  draftData: CampaignDraftDataSchema,
});

export type CampaignTemplate = z.infer<typeof CampaignTemplateSchema>;
