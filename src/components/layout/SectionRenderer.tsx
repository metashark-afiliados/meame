// RUTA: src/components/layout/SectionRenderer.tsx
/**
 * @file SectionRenderer.tsx
 * @description Motor de renderizado de élite. Actúa como un despachador dinámico
 *              que mapea nombres de sección a sus componentes React reales.
 * @version 18.0.0 (Union Type Contract & Holistic Integrity)
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
import * as Sections from "@/components/sections";

// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: CONTRATO DE UNIÓN] ---
// Se define un contrato de props genérico que todos los componentes deben satisfacer.
type GenericSectionProps = {
  content: any; // La validación real la hace Zod en tiempo de ejecución.
  locale: Locale;
  isFocused?: boolean;
};

// Se define un tipo de unión que acepta tanto componentes de función simples
// como componentes que utilizan React.forwardRef.
type GenericSectionComponent =
  | React.FunctionComponent<GenericSectionProps>
  | React.ForwardRefExoticComponent<
      GenericSectionProps & React.RefAttributes<HTMLElement>
    >;

// El mapa de componentes ahora se valida contra este nuevo tipo de unión robusto.
const componentMap: Record<SectionName, GenericSectionComponent> = {
  // --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---
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
  ScrollingBanner: Sections.ScrollingBanner, // <-- PROPIEDAD AÑADIDA
  ServicesSection: Sections.ServicesSection,
  SocialProofLogos: Sections.SocialProofLogos,
  SponsorsSection: Sections.SponsorsSection,
  TeamSection: Sections.TeamSection,
  TestimonialCarouselSection: Sections.TestimonialCarouselSection,
  TestimonialGrid: Sections.TestimonialGrid,
  TextSection: Sections.TextSection,
  ThumbnailCarousel: Sections.ThumbnailCarousel,
  ArticleBody: Sections.ArticleBody,
  CommentSection: Sections.CommentSection,
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
  logger.info(
    "[SectionRenderer v18.0] Ensamblando página con contrato de unión."
  );

  const renderSection = (section: { name: string }, index: number) => {
    const sectionName = section.name as SectionName;
    const config = sectionsConfig[sectionName];
    const Component = componentMap[sectionName];

    if (!config || !Component) {
      logger.warn(
        `[SectionRenderer] Configuración o Componente para "${sectionName}" no encontrado.`
      );
      return null;
    }

    const { dictionaryKey, schema } = config;
    const contentData = (dictionary as Record<string, unknown>)[dictionaryKey];
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
