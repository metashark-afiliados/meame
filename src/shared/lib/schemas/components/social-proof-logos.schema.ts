// lib/schemas/components/social-proof-logos.schema.ts
/**
 * @file social-proof-logos.schema.ts
 * @description Esquema de Zod para el contenido i18n del componente SocialProofLogos.
 *              - v4.0.0 (Architectural Fix): Desacopla el schema de contenido del schema
 *                de locale.
 * @version 4.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { logger } from "@/shared/lib/logging";

logger.trace("[Schema] Definiendo contrato para [SocialProofLogos]");

/**
 * @const LogoSchema
 * @description Valida la estructura de un único logo.
 */
const LogoSchema = z.object({
  src: z
    .string()
    .startsWith("/", "La ruta de la imagen debe ser absoluta desde /public."),
  alt: z.string().min(1, "El texto alternativo del logo es requerido."),
});

export type Logo = z.infer<typeof LogoSchema>;

/**
 * @const SocialProofLogosContentSchema
 * @description La SSoT para la ESTRUCTURA del contenido de la sección.
 */
export const SocialProofLogosContentSchema = z.object({
  title: z.string(),
  logos: z.array(LogoSchema),
});

/**
 * @const SocialProofLogosLocaleSchema
 * @description Valida la clave de nivel superior para un locale específico.
 */
export const SocialProofLogosLocaleSchema = z.object({
  socialProofLogos: SocialProofLogosContentSchema.optional(),
});

export const SocialProofLogosI18nSchema = z.object({
  "es-ES": SocialProofLogosLocaleSchema,
  "pt-BR": SocialProofLogosLocaleSchema,
  "en-US": SocialProofLogosLocaleSchema,
  "it-IT": SocialProofLogosLocaleSchema,
});
// lib/schemas/components/social-proof-logos.schema.ts
