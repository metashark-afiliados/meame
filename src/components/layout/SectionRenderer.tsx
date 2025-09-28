// RUTA: src/components/layout/SectionRenderer.tsx
/**
 * @file SectionRenderer.tsx
 * @description Motor de renderizado de secciones de élite. Mapea dinámicamente
 *              los nombres de sección a sus componentes correspondientes y les
 *              inyecta el contenido validado. Es el corazón de las páginas de campaña.
 * @version 22.0.0 (Elite & Resilient Engine)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { forwardRef } from "react";
import { motion, type Variants } from "framer-motion";
import { logger } from "@/shared/lib/logging";
import { sectionsConfig } from "@/shared/lib/config/sections.config";
import {
  BenefitsSection,
  CommunitySection,
  ContactSection,
  DoubleScrollingBanner,
  FaqAccordion,
  FeaturedArticlesCarousel,
  FeaturesSection,
  GuaranteeSection,
  Hero,
  HeroNews,
  IngredientAnalysis,
  NewsGrid,
  OrderSection,
  PricingSection,
  ProductShowcase,
  ServicesSection,
  SocialProofLogos,
  SponsorsSection,
  TeamSection,
  TestimonialCarouselSection,
  TestimonialGrid,
  TextSection,
  ThumbnailCarousel,
  ScrollingBanner,
  CommentSection,
} from "@/components/sections";
import { ValidationError } from "@/components/ui/ValidationError";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";

const componentMap = {
  BenefitsSection,
  CommunitySection,
  ContactSection,
  DoubleScrollingBanner,
  FaqAccordion,
  FeaturedArticlesCarousel,
  FeaturesSection,
  GuaranteeSection,
  Hero,
  HeroNews,
  IngredientAnalysis,
  NewsGrid,
  OrderSection,
  PricingSection,
  ProductShowcase,
  ScrollingBanner,
  ServicesSection,
  SocialProofLogos,
  SponsorsSection,
  TeamSection,
  TestimonialCarouselSection,
  TestimonialGrid,
  TextSection,
  ThumbnailCarousel,
  CommentSection,
};

interface SectionRendererProps {
  sections: { name: string }[];
  dictionary: Dictionary;
  locale: Locale;
  isFocused?: boolean;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const SectionRenderer = forwardRef<HTMLElement, SectionRendererProps>(
  ({ sections, dictionary, locale }, ref) => {
    logger.info(
      `[SectionRenderer] Renderizando ${sections.length} secciones (v22.0).`
    );

    return (
      <motion.div initial="hidden" animate="visible" variants={{}}>
        {sections.map((section, index) => {
          const config =
            sectionsConfig[section.name as keyof typeof sectionsConfig];
          const Component =
            componentMap[section.name as keyof typeof componentMap];

          if (!config || !Component) {
            logger.warn(
              `Componente para la sección "${section.name}" no encontrado.`
            );
            return null;
          }

          const contentData = (dictionary as Record<string, unknown>)[
            config.dictionaryKey
          ];
          const validation = config.schema.safeParse(contentData);

          if (!validation.success) {
            return (
              <ValidationError
                key={`${section.name}-${index}-error`}
                sectionName={section.name}
                error={validation.error}
                content={dictionary.validationError!}
              />
            );
          }

          const componentProps = {
            content: validation.data,
            locale: locale,
          };

          return (
            <motion.div
              key={`${section.name}-${index}`}
              variants={sectionVariants}
            >
              {/* @ts-expect-error La aserción de tipos es deliberada para el renderizado dinámico. */}
              <Component {...componentProps} />
            </motion.div>
          );
        })}
      </motion.div>
    );
  }
);
SectionRenderer.displayName = "SectionRenderer";
