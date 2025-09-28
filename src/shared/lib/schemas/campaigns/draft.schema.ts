// RUTA: src/shared/lib/schemas/campaigns/draft.schema.ts
/**
 * @file draft.schema.ts
 * @description SSoT para el schema del borrador de campaña en la base de datos.
 *              v3.0.0 (Production Ready): Define explícitamente el contrato para
 *              los datos almacenados en la columna JSONB de Supabase.
 * @version 3.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import {
  HeaderConfigSchema,
  FooterConfigSchema,
  LayoutConfigSchema,
  ThemeConfigSchema,
  ContentDataSchema,
} from "./draft.parts.schema";

// Schema para los datos que se guardan en la columna draft_data (JSONB)
export const CampaignDraftDataSchema = z.object({
  draftId: z.string(),
  baseCampaignId: z.string().nullable(),
  variantName: z.string().nullable(),
  seoKeywords: z.string().nullable(),
  affiliateNetwork: z.string().nullable(),
  affiliateUrl: z.string().nullable(),
  headerConfig: HeaderConfigSchema,
  footerConfig: FooterConfigSchema,
  layoutConfig: LayoutConfigSchema,
  themeConfig: ThemeConfigSchema,
  contentData: ContentDataSchema,
  completedSteps: z.array(z.number()),
  updatedAt: z.string().datetime(), // Se incluye para consistencia de datos
});

// Schema completo que representa una fila en la tabla `campaign_drafts`
export const CampaignDraftDbSchema = z.object({
  draft_id: z.string(),
  user_id: z.string(),
  draft_data: CampaignDraftDataSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type CampaignDraftDb = z.infer<typeof CampaignDraftDbSchema>;
