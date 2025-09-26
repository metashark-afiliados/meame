// RUTA: src/components/layout/SectionRenderer.tsx
/**
 * @file SectionRenderer.tsx
 * @description Motor de renderizado con decorador de foco y aserción de tipo segura.
 * @version 25.0.0 (Build Integrity & Type-Safe Assertion)
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
import type { LayoutConfigItem } from "@/shared/lib/types/campaigns/draft.types";
import { cn } from "@/shared/lib/utils/cn";

// --- [INICIO DE SOLUCIÓN DE ÉLITE] ---
// Se define un tipo genérico para cualquier componente de sección.
// Esto nos permite hacer una aserción de tipo segura en lugar de usar 'any'.
type AnySectionComponent = React.ComponentType<{
  content: unknown;
  locale: Locale;
  [key: string]: unknown;
}>;
// --- [FIN DE SOLUCIÓN DE ÉLITE] ---

interface SectionRendererProps {
  sections: LayoutConfigItem[];
  dictionary: Dictionary;
  locale: Locale;
  dynamicData?: Record<string, unknown>;
  focusedSection?: string | null;
  sectionRefs?: React.MutableRefObject<Record<string, HTMLElement | null>>;
}

export function SectionRenderer({
  sections,
  dictionary,
  locale,
  dynamicData = {},
  focusedSection,
  sectionRefs,
}: SectionRendererProps): React.ReactElement {
  logger.info(
    "[SectionRenderer v25.0] Ensamblando con aserción de tipo SEGURA."
  );

  return (
    <>
      {sections.map((section, index) => {
        if (!section || !section.name) return null;

        const sectionName = section.name as SectionName;
        const config = sectionsConfig[sectionName];
        if (!config) return null;

        const { component: Component, dictionaryKey, schema } = config;
        const contentData = (dictionary as Record<string, unknown>)[
          dictionaryKey
        ];
        const validation = schema.safeParse(contentData);

        if (!validation.success) {
          if (process.env.NODE_ENV === "development") {
            return (
              <ValidationError
                key={`${sectionName}-${index}-error`}
                sectionName={sectionName}
                error={validation.error}
                content={dictionary.validationError!}
              />
            );
          }
          return null;
        }

        const dynamicProps =
          typeof dynamicData[sectionName] === "object" &&
          dynamicData[sectionName] !== null
            ? dynamicData[sectionName]
            : {};

        const componentProps = {
          content: validation.data,
          locale,
          ...dynamicProps,
        };

        const sectionRef = (el: HTMLElement | null) => {
          if (sectionRefs) {
            sectionRefs.current[sectionName] = el;
          }
        };

        const isCurrentlyFocused = focusedSection === sectionName;

        // Se realiza la aserción de tipo segura.
        const TypedComponent = Component as AnySectionComponent;

        return (
          <div
            key={`${sectionName}-${index}`}
            ref={sectionRef}
            className={cn(
              "transition-all duration-300 rounded-lg",
              isCurrentlyFocused &&
                "ring-2 ring-primary ring-offset-4 ring-offset-background"
            )}
          >
            <TypedComponent {...componentProps} />
          </div>
        );
      })}
    </>
  );
}
