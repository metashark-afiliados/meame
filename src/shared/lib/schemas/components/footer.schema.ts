// RUTA: src/shared/lib/schemas/components/footer.schema.ts
/**
 * @file footer.schema.ts
 * @description Define el contrato de datos para el contenido del Footer.
 *              v6.1.0 (Type Export Fix): Exporta los tipos inferidos para
 *              ser consumidos por el componente, resolviendo errores TS2305.
 * @version 6.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { LucideIconNameSchema } from "@/shared/lib/config/lucide-icon-names";

const LinkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const SocialLinkSchema = z.object({
  name: z.string(),
  icon: LucideIconNameSchema,
  url: z.string().url(),
});

const LinkColumnSchema = z.object({
  title: z.string(),
  links: z.array(LinkSchema),
});

// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
// Exportar los tipos inferidos para que sean consumibles por otros módulos.
export type LinkColumn = z.infer<typeof LinkColumnSchema>;
export type LinkType = z.infer<typeof LinkSchema>;
export type SocialLink = z.infer<typeof SocialLinkSchema>;
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---

export const FooterContentSchema = z.object({
  newsletter: z.object({
    title: z.string(),
    description: z.string(),
    placeholder: z.string(),
    buttonText: z.string(),
    buttonAriaLabel: z.string(),
  }),
  linkColumns: z.array(LinkColumnSchema),
  socialLinks: z.array(SocialLinkSchema),
  copyright: z.string(),
  disclaimer: z.string(),
  developerLink: LinkSchema.optional(),
});

export const FooterLocaleSchema = z.object({
  footer: FooterContentSchema,
});
