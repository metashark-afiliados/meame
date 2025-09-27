// RUTA: src/components/layout/SectionRenderer.tsx
/**
 * @file SectionRenderer.tsx
 * @description Motor de renderizado soberano. Mapea nombres de sección a
 *              componentes y los renderiza con datos validados.
 * @version 26.0.0 (Component Mapping Decoupling)
 * @author RaZ Podestá - MetaShark Tech
 */
import * as React from "react";
import {
  sectionsConfig,
  type SectionName,
} from "@/shared/lib/config/sections.config";
import * as Sections from "@/components/sections";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { ValidationError } from "@/components/ui/ValidationError";
import type { LayoutConfigItem } from "@/shared/lib/types/campaigns/draft.types";
import { cn } from "@/shared/lib/utils/cn";

// SSoT del Mapeo Componente-Nombre
const componentMap = {
  BenefitsSection: Sections.BenefitsSection,
  CommunitySection: Sections.CommunitySection,
  CommentSection: Sections.CommentSection,
  ContactSection: Sections.ContactSection,
  DoubleScrollingBanner: Sections.DoubleScrollingBanner,
  FaqAccordion: Sections.FaqAccordion,
  FeaturedArticlesCarousel: Sections.FeaturedArticlesCarousel,
  FeaturesSection: Sections.FeaturesSection,
  GuaranteeSection: Sections.GuaranteeSection,
  Hero: Sections.Hero,
  HeroClient: Sections.HeroClient,
  HeroNews: Sections.HeroNews,
  IngredientAnalysis: Sections.IngredientAnalysis,
  NewsGrid: Sections.NewsGrid,
  OrderSection: Sections.OrderSection,
  PricingSection: Sections.PricingSection,
  ProductShowcase: Sections.ProductShowcase,
  ScrollingBanner: Sections.ScrollingBanner,
  ServicesSection: Sections.ServicesSection,
  SocialProofLogos: Sections.SocialProofLogos,
  SponsorsSection: Sections.SponsorsSection,
  TeamSection: Sections.TeamSection,
  TestimonialCarouselSection: Sections.TestimonialCarouselSection,
  TestimonialGrid: Sections.TestimonialGrid,
  TextSection: Sections.TextSection,
  ThumbnailCarousel: Sections.ThumbnailCarousel,
  ArticleBody: Sections.ArticleBody,
};

type AnySectionComponent = React.ComponentType<{
  content: unknown;
  locale: Locale;
  [key: string]: unknown;
}>;

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
  logger.info("[SectionRenderer v26.0] Ensamblando con mapeo desacoplado.");

  return (
    <>
      {sections.map((section, index) => {
        if (!section || !section.name) return null;

        const sectionName = section.name as SectionName;
        const config = sectionsConfig[sectionName];
        const Component = componentMap[
          sectionName as keyof typeof componentMap
        ] as AnySectionComponent | undefined;

        if (!config || !Component) return null;

        const { dictionaryKey, schema } = config;
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

        const componentProps = {
          content: validation.data,
          locale,
          ...(dynamicData[sectionName] || {}),
        };

        const sectionRef = (el: HTMLElement | null) => {
          if (sectionRefs) sectionRefs.current[sectionName] = el;
        };
        const isCurrentlyFocused = focusedSection === sectionName;

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
            <Component {...componentProps} />
          </div>
        );
      })}
    </>
  );
}
