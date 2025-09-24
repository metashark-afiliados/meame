// shared/lib/schemas/components/dev/dev-header.schema.ts
/**
 * @file dev-header.schema.ts
 * @description SSoT para el contrato de datos i18n del componente DevHeader.
 *              v2.0.0 (Full i18n Compliance): Se expande el schema para incluir
 *              todas las cadenas de texto requeridas por el componente,
 *              asegurando una internacionalización y accesibilidad completas.
 * @version 2.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";

export const DevHeaderContentSchema = z.object({
  title: z.string(),
  logoAlt: z.string(),
  homeLinkAriaLabel: z.string(),
});

export const DevHeaderLocaleSchema = z.object({
  devHeader: DevHeaderContentSchema.optional(),
});
// shared/lib/schemas/components/dev/dev-header.schema.ts
