// RUTA: src/shared/lib/schemas/components/scrolling-banner.schema.ts
/**
 * @file scrolling-banner.schema.ts
 * @description SSoT para el contrato de datos del componente ScrollingBanner,
 *              restaurado a su integridad arquitectónica y mejorado.
 * @version 4.0.0 (Architectural Integrity Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";

/**
 * @const ScrollingBannerContentSchema
 * @description La SSoT para la ESTRUCTURA del contenido de la sección.
 */
export const ScrollingBannerContentSchema = z.object({
  message: z.string().min(1, "El mensaje del banner no puede estar vacío."),
});

/**
 * @const ScrollingBannerLocaleSchema
 * @description Valida la clave de nivel superior para un locale específico.
 */
export const ScrollingBannerLocaleSchema = z.object({
  scrollingBanner: ScrollingBannerContentSchema.optional(),
});

/**
 * @const ScrollingBannerI18nSchema
 * @description Valida la estructura completa del archivo .i18n.json, manteniendo
 *              la compatibilidad con el sistema de ensamblaje de i18n.
 */
export const ScrollingBannerI18nSchema = z.object({
  "es-ES": ScrollingBannerLocaleSchema,
  "pt-BR": ScrollingBannerLocaleSchema,
  "en-US": ScrollingBannerLocaleSchema,
  "it-IT": ScrollingBannerLocaleSchema,
});
