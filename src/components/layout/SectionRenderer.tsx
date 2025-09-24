// Ruta correcta: src/components/layout/SectionRenderer.tsx
/**
 * @file SectionRenderer.tsx
 * @description Motor de renderizado de élite del lado del servidor.
 *              v15.0.0 (Definitive Index Signature Fix): Resuelve el error de tipo
 *              TS2538 mediante una aserción de tipo segura, garantizando la correcta
 *              indexación de diccionarios complejos.
 * @version 15.0.0
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

type GenericSectionComponent = React.ForwardRefExoticComponent<
  {
    content: Record<string, unknown>;
    locale: Locale;
    isFocused?: boolean;
  } & React.RefAttributes<HTMLElement>
>;

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
    "[SectionRenderer v15.0] Ensamblando página (Index Signature Fix)..."
  );

  const renderSection = (section: { name: string }, index: number) => {
    const sectionName = section.name as SectionName;
    const config = sectionsConfig[sectionName];

    if (!config) {
      logger.warn(
        `[SectionRenderer] Configuración para "${sectionName}" no encontrada.`
      );
      return null;
    }

    const { component, dictionaryKey, schema } = config;

    // --- [INICIO DE CORRECCIÓN DE TIPO TS2538] ---
    const contentData = (dictionary as Record<string, unknown>)[dictionaryKey];
    // --- [FIN DE CORRECCIÓN DE TIPO TS2538] ---

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
        `[SectionRenderer] Fallo de validación de datos para la sección '${sectionName}'. No se renderizará en producción.`
      );
      return null;
    }

    const Component = component as GenericSectionComponent;
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

    logger.trace(
      `[SectionRenderer] Renderizando sección #${index + 1}: ${sectionName}`
    );

    return <Component key={`${sectionName}-${index}`} {...componentProps} />;
  };

  return (
    <SectionAnimator>
      {sections
        .filter((section): section is { name: string } => {
          const isValid =
            typeof section.name === "string" && section.name.length > 0;
          if (!isValid)
            logger.warn(`[SectionRenderer] Sección inválida omitida.`, {
              sectionData: section,
            });
          return isValid;
        })
        .map(renderSection)}
    </SectionAnimator>
  );
}
