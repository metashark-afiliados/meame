// Ruta correcta: src/shared/lib/schemas/pages/select-language.schema.ts
/**
 * @file select-language.schema.ts
 * @description SSoT para el contrato de datos del contenido i18n de la página de selección de idioma.
 * @version 2.0.0 (Architectural Relocation & Refactoring)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { supportedLocales } from "@/shared/lib/i18n/i18n.config";

export const SelectLanguagePageContentSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  languages: z.record(z.enum(supportedLocales), z.string()),
});

export type SelectLanguagePageContent = z.infer<
  typeof SelectLanguagePageContentSchema
>;
// Ruta correcta: src/shared/lib/schemas/pages/select-language.schema.ts
