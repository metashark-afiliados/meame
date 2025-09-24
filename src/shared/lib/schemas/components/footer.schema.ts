// Ruta correcta: src/shared/lib/schemas/components/footer.schema.ts
/**
 * @file footer.schema.ts
 * @description Define el contrato de datos para el contenido del Footer.
 * @version 6.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { lucideIconNames } from "@/shared/lib/config/lucide-icon-names";

// Se elimina la importación y la llamada a `logger`.

const LinkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const SocialLinkSchema = z.object({
  name: z.string(),
  icon: z.enum(lucideIconNames),
  url: z.string().url(),
});

const LinkColumnSchema = z.object({
  title: z.string(),
  links: z.array(LinkSchema),
});

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
// Ruta correcta: src/shared/lib/schemas/components/footer.schema.ts
