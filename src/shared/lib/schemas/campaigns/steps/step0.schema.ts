// RUTA: src/shared/lib/schemas/campaigns/steps/step0.schema.ts
/**
 * @file step0.schema.ts
 * @description SSoT para los contratos de datos del Paso 0 de la SDC.
 *              Define tanto el contenido i18n como el schema de validación del formulario.
 * @version 3.0.0 (Contract Unification)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";

// Schema para el contenido i18n de la UI del paso
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
  passportStampLabel: z
    .string()
    .describe("Texto que se muestra durante la animación del sello."),
});

// Schema para la validación de los datos del formulario
export const step0Schema = z.object({
  baseCampaignId: z
    .string()
    .min(1, { message: "Debes seleccionar una campaña base." }),
  variantName: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  seoKeywords: z
    .string()
    .min(5, { message: "Debes añadir al menos una palabra clave." }),
  affiliateNetwork: z
    .string()
    .min(1, { message: "Debes seleccionar una red de afiliados." }),
  affiliateUrl: z
    .string()
    .url({ message: "Por favor, introduce una URL válida." }),
});

// Tipo inferido para los datos del formulario
export type Step0Data = z.infer<typeof step0Schema>;
