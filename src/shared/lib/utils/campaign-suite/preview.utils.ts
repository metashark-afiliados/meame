// app/[locale]/(dev)/dev/campaign-suite/_utils/preview.utils.ts
/**
 * @file preview.utils.ts
 * @description Utilidades del lado del cliente para ensamblar los datos de la vista previa.
 * @version 1.1.0 (Type Safety)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import type {
  ContentData,
  LayoutConfigItem,
} from "@/shared/lib/types/campaigns/draft.types";
import { sectionsConfig } from "@/shared/lib/config/sections.config";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";

/**
 * @function buildPreviewDictionary
 * @description Transforma los datos de contenido del borrador en un diccionario
 *              parcial que el SectionRenderer puede consumir.
 */
export function buildPreviewDictionary(
  contentData: ContentData,
  layoutConfig: LayoutConfigItem[],
  locale: Locale
): Partial<Dictionary> {
  const dictionary: Partial<Dictionary> = {};

  for (const section of layoutConfig) {
    const sectionKey =
      sectionsConfig[section.name as keyof typeof sectionsConfig]
        ?.dictionaryKey;

    if (
      sectionKey &&
      contentData[section.name] &&
      contentData[section.name][locale]
    ) {
      // --- [INICIO DE CORRECCIÓN: @typescript-eslint/no-explicit-any] ---
      // Se utiliza una aserción de tipo para informar a TypeScript sobre la estructura.
      (dictionary as Record<string, unknown>)[sectionKey] =
        contentData[section.name][locale];
      // --- [FIN DE CORRECCIÓN] ---
    }
  }

  return dictionary;
}
// app/[locale]/(dev)/dev/campaign-suite/_utils/preview.utils.ts
