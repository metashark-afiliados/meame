// RUTA: src/components/layout/SectionRenderer.tsx
/**
 * @file SectionRenderer.tsx
 * @description Motor de renderizado de élite y Guardián de Contratos.
 *              Despacha dinámicamente componentes de sección, validando sus
 *              datos en tiempo de ejecución contra la SSoT de configuración.
 * @version 17.0.0 (Data Contract Guardian Architecture)
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
    "[SectionRenderer v17.0] Ensamblando página como Guardián de Contratos."
  );

  return (
    <SectionAnimator>
      {sections.map((section, index) => {
        // Guardia de resiliencia para datos de layout malformados
        if (!section || !section.name) {
          logger.warn(
            `[SectionRenderer] Sección en el índice ${index} es inválida y será omitida.`
          );
          return null;
        }

        const sectionName = section.name as SectionName;
        const config = sectionsConfig[sectionName];

        // Guardia de resiliencia para componentes no registrados
        if (!config) {
          logger.warn(
            `[SectionRenderer] Configuración para "${sectionName}" no encontrada en sections.config.ts.`
          );
          return null;
        }

        const { component: Component, dictionaryKey, schema } = config;
        const contentData = (dictionary as Record<string, unknown>)[
          dictionaryKey
        ];
        const validation = schema.safeParse(contentData);

        // Guardia de Contrato de Datos con feedback de desarrollo de élite (MEA/DX)
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
            `[SectionRenderer] Fallo de validación para '${sectionName}'. No se renderizará en producción.`
          );
          return null;
        }

        const componentProps = {
          content: validation.data,
          locale: locale,
          isFocused: sectionName === focusedSection,
          ref: (el: HTMLElement | null) => {
            if (sectionRefs && el) {
              sectionRefs.current[sectionName] = el;
            } else if (sectionRefs) {
              delete sectionRefs.current[sectionName];
            }
          },
        };

        return (
          <Component key={`${sectionName}-${index}`} {...componentProps} />
        );
      })}
    </SectionAnimator>
  );
}
