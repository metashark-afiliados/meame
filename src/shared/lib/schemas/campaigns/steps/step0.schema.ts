// shared/lib/schemas/campaigns/steps/step0.schema.ts
/**
 * @file step0.schema.ts
 * @description Schema atómico para el contenido i18n del Paso 0 de la SDC.
 * @version 2.0.0 (Gamification MEA/UX)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";

export const Step0ContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  baseCampaignLabel: z.string(),
  baseCampaignPlaceholder: z.string(),
  baseCampaignDescription: z.string(),
  variantNameLabel: z.string(),
  variantNamePlaceholder: z.string(),
  seoKeywordsLabel: z.string(),
  seoKeywordsPlaceholder: z.string(),
  seoKeywordsDescription: z.string(),
  affiliateNetworkLabel: z.string(),
  affiliateNetworkPlaceholder: z.string(),
  affiliateUrlLabel: z.string(),
  affiliateUrlPlaceholder: z.string(),
  // --- NUEVA CLAVE PARA GAMIFICACIÓN ---
  passportStampLabel: z
    .string()
    .describe("Texto que se muestra durante la animación del sello."),
});
// shared/lib/schemas/campaigns/steps/step0.schema.ts
