// lib/schemas/pages/text-page.schema.ts
/**
 * @file text-page.schema.ts
 * @description Schema genérico y reutilizable para páginas de contenido estático
 *              basadas en bloques de texto (ej. Sobre Nosotros, Privacidad, Términos).
 * @version 3.0.0 (Generic & Reusable)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { ContentBlocksSchema } from "@/shared/lib/schemas/components/content-block.schema";

/**
 * @const TextPageContentSchema
 * @description La SSoT para la estructura del contenido de una página de texto.
 */
export const TextPageContentSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  content: ContentBlocksSchema,
});

/**
 * @const TextPageLocaleSchema
 * @description Valida la clave de nivel superior para una página de texto en un
 *              diccionario de locale. La clave es opcional.
 */
export const TextPageLocaleSchema = z.object({
  aboutPage: TextPageContentSchema.optional(),
  privacyPage: TextPageContentSchema.optional(),
  termsPage: TextPageContentSchema.optional(),
  cookiesPage: TextPageContentSchema.optional(), // Nueva página de cookies
});
// lib/schemas/pages/text-page.schema.ts
