// lib/schemas/campaigns/draft.schema.ts
/**
 * @file draft.schema.ts
 * @description SSoT para el schema del borrador de campaña en la base de datos.
 * @version 1.0.0
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

// Schema para los datos que se guardan (sin 'step')
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
});

// Schema completo del documento en la DB
export const CampaignDraftDbSchema = CampaignDraftDataSchema.extend({
  userId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CampaignDraftDb = z.infer<typeof CampaignDraftDbSchema>;
