// RUTA: src/components/layout/SectionRenderer.tsx
/**
 * @file SectionRenderer.tsx
 * @description Motor de renderizado de élite y Guardián de Contratos.
 * @version 19.0.0 (Definitive Type-Safe Solution)
 * @author RaZ Podestá - MetaShark Tech
 */
import * as React from "react";
import {
  sectionsConfig,
  type SectionName,
} from "@/shared/lib/config/sections.config";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { ValidationError } from "@/components/ui/ValidationError";
import { SectionAnimator } from "./SectionAnimator";
import type { z } from "zod"; // Importar z para inferencia de tipo

interface SectionRendererProps {
  sections: { name?: string | undefined }[];
  dictionary: Dictionary;
  locale: Locale;
  focusedSection?: string | null;
  sectionRefs?: React.MutableRefObject<Record<string, HTMLElement>>;
}

export function SectionRenderer({
  sections,
  dictionary,
  locale,
  focusedSection = null,
  sectionRefs,
}: SectionRendererProps): React.ReactElement {
  logger.info(
    "[SectionRenderer v19.0] Ensamblando página con seguridad de tipos definitiva."
  );

  return (
    <SectionAnimator>
      {sections.map((section, index) => {
        if (!section || !section.name) {
          logger.warn(
            `[SectionRenderer] Sección en el índice ${index} es inválida y será omitida.`
          );
          return null;
        }

        const sectionName = section.name as SectionName;
        const config = sectionsConfig[sectionName];

        if (!config) {
          logger.warn(
            `[SectionRenderer] Configuración para "${sectionName}" no encontrada.`
          );
          return null;
        }

        const { component: Component, dictionaryKey, schema } = config;
        const contentData = (dictionary as Record<string, unknown>)[
          dictionaryKey
        ];
        const validation = schema.safeParse(contentData);

        if (!validation.success) {
          if (
            process.env.NODE_ENV === "development" &&
            dictionary.validationError
          ) {
            return (
              <ValidationError
                key={`${sectionName}-${index}-error`}
                sectionName={sectionName}
                error={validation.error}
                content={dictionary.validationError}
              />
            );
          }
          logger.error(
            `[SectionRenderer] Fallo de validación para '${sectionName}'. No se renderizará.`
          );
          return null;
        }

        // --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: SEGURIDAD DE TIPOS ABSOLUTA] ---
        // Se pasa cada prop individualmente. La prop 'content' recibe una aserción
        // de tipo explícita y segura, basada en la inferencia del schema
        // que acabamos de validar. Esto elimina 'any' y satisface a ESLint.
        return (
          <Component
            key={`${sectionName}-${index}`}
            content={validation.data as z.infer<typeof schema>}
            locale={locale}
            isFocused={sectionName === focusedSection}
            ref={(el: HTMLElement | null) => {
              if (sectionRefs && el) {
                sectionRefs.current[sectionName] = el;
              } else if (sectionRefs) {
                delete sectionRefs.current[sectionName];
              }
            }}
          />
        );
        // --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---
      })}
    </SectionAnimator>
  );
}
