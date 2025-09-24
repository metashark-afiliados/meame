// lib/schemas/components/hero.schema.ts
/**
 * @file hero.schema.ts
 * @description Esquema de Zod para el contenido i18n del componente Hero.
 * @version 3.0.0 (Architectural Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { logger } from "@/shared/lib/logging";

logger.trace("[Schema] Definiendo contrato para [Hero]");

/**
 * @const HeroContentSchema
 * @description La SSoT para la ESTRUCTURA del contenido de la sección.
 */
export const HeroContentSchema = z.object({
  title: z.string().min(1, "El título es requerido."),
  subtitle: z.string().min(1, "El subtítulo es requerido."),
});

/**
 * @const HeroLocaleSchema
 * @description Valida la clave de nivel superior para un locale específico.
 */
export const HeroLocaleSchema = z.object({
  hero: HeroContentSchema.optional(),
});
// lib/schemas/components/hero.schema.ts
