// RUTA: src/components/layout/SectionRenderer.tsx
/**
 * @file SectionRenderer.tsx
 * @description Motor de renderizado de élite. Actúa como un despachador dinámico
 *              que mapea nombres de sección a sus componentes React reales.
 * @version 17.0.0 (Holistic Integrity Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
import * as React from "react";
import { sectionsConfig, type SectionName } from "@/shared/lib/config/sections.config";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { ValidationError } from "@/components/ui/ValidationError";
import { SectionAnimator } from "./SectionAnimator";
import * as Sections from "@/components/sections";

// Pilar I: Contrato de tipo soberano y seguro para los componentes de sección.
type GenericSectionComponent = React.ForwardRefExoticComponent<
  {
    content: Record<string, unknown>;
    locale: Locale;
    isFocused?: boolean;
  } & React.RefAttributes<HTMLElement>
>;

// El mapa se alinea 100% con las claves exportadas por `sectionsConfig`.
const componentMap: Record<SectionName, GenericSectionComponent> = {
  BenefitsSection: Sections.BenefitsSection,
  CommunitySection: Sections.CommunitySection,
  ContactSection: Sections.ContactSection,
  DoubleScrollingBanner: Sections.DoubleScrollingBanner,
  FaqAccordion: Sections.FaqAccordion,
  FeaturedArticlesCarousel: Sections.FeaturedArticlesCarousel,
  FeaturesSection: Sections.FeaturesSection,
  GuaranteeSection: Sections.GuaranteeSection,
  Hero: Sections.Hero,
  HeroNews: Sections.HeroNews,
  IngredientAnalysis: Sections.IngredientAnalysis,
  NewsGrid: Sections.NewsGrid,
  OrderSection: Sections.OrderSection,
  PricingSection: Sections.PricingSection,
  ProductShowcase: Sections.ProductShowcase,
  ServicesSection: Sections.ServicesSection,
  SocialProofLogos: Sections.SocialProofLogos,
  SponsorsSection: Sections.SponsorsSection,
  TeamSection: Sections.TeamSection,
  TestimonialCarouselSection: Sections.TestimonialCarouselSection,
  TestimonialGrid: Sections.TestimonialGrid,
  TextSection: Sections.TextSection,
  ThumbnailCarousel: Sections.ThumbnailCarousel,
};

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
  logger.info("[SectionRenderer v17.0] Ensamblando página con despachador dinámico restaurado.");

  const renderSection = (section: { name: string }, index: number) => {
    const sectionName = section.name as SectionName;
    const config = sectionsConfig[sectionName];
    const Component = componentMap[sectionName];

    if (!config || !Component) {
      logger.warn(`[SectionRenderer] Configuración o Componente para "${sectionName}" no encontrado.`);
      return null; // Lógica de retorno restaurada
    }

    const { dictionaryKey, schema } = config;
    const contentData = (dictionary as Record<string, unknown>)[dictionaryKey];
    const validation = schema.safeParse(contentData);

    if (!validation.success) {
      if (process.env.NODE_ENV === "development" && dictionary.validationError) {
        // Invocación correcta de ValidationError
        return (
          <ValidationError
            key={`${sectionName}-${index}-error`}
            sectionName={sectionName}
            error={validation.error}
            content={dictionary.validationError}
          />
        );
      }
      logger.error(`[SectionRenderer] Fallo de validación para '${sectionName}'. No se renderizará.`);
      return null; // Lógica de retorno restaurada
    }

    // Lógica de props restaurada
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

    logger.trace(`[SectionRenderer] Renderizando sección #${index + 1}: ${sectionName}`);

    return <Component key={`${sectionName}-${index}`} {...componentProps} />;
  };

  return (
    <SectionAnimator>
      {sections
        .filter((section): section is { name: string } => {
          const isValid = typeof section.name === "string" && section.name.length > 0;
          if (!isValid) logger.warn(`[SectionRenderer] Sección inválida omitida.`, { sectionData: section });
          return isValid;
        })
        .map(renderSection)}
    </SectionAnimator>
  );
}
// RUTA: src/components/layout/SectionRenderer.tsx
