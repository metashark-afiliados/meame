// RUTA: src/shared/lib/config/sections.config.ts
/**
 * @file sections.config.ts
 * @description SSoT para el registro de METADATOS de sección. Este aparato
 *              está ahora desacoplado de la implementación de componentes.
 * @version 28.0.0 (Decoupled & Pure)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { logger } from "@/shared/lib/logging";
import * as Schemas from "@/shared/lib/schemas/components";

logger.trace(
  "[sections.config.ts] Módulo de registro de metadatos de sección cargado (v28.0)."
);

interface SectionMetadata {
  dictionaryKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodObject<any>;
}

export const sectionsConfig = {
  BenefitsSection: {
    dictionaryKey: "benefitsSection",
    schema: Schemas.BenefitsSectionContentSchema,
  },
  CommunitySection: {
    dictionaryKey: "communitySection",
    schema: Schemas.CommunitySectionContentSchema,
  },
  CommentSection: {
    dictionaryKey: "commentSection",
    schema: Schemas.CommentSectionContentSchema,
  },
  ContactSection: {
    dictionaryKey: "contactSection",
    schema: Schemas.ContactSectionContentSchema,
  },
  DoubleScrollingBanner: {
    dictionaryKey: "doubleScrollingBanner",
    schema: Schemas.DoubleScrollingBannerContentSchema,
  },
  FaqAccordion: {
    dictionaryKey: "faqAccordion",
    schema: Schemas.FaqAccordionContentSchema,
  },
  FeaturedArticlesCarousel: {
    dictionaryKey: "featuredArticlesCarousel",
    schema: Schemas.FeaturedArticlesCarouselContentSchema,
  },
  FeaturesSection: {
    dictionaryKey: "featuresSection",
    schema: Schemas.FeaturesSectionContentSchema,
  },
  GuaranteeSection: {
    dictionaryKey: "guaranteeSection",
    schema: Schemas.GuaranteeSectionContentSchema,
  },
  Hero: {
    dictionaryKey: "hero",
    schema: Schemas.HeroContentSchema,
  },
  HeroNews: {
    dictionaryKey: "heroNews",
    schema: Schemas.HeroNewsContentSchema,
  },
  IngredientAnalysis: {
    dictionaryKey: "ingredientAnalysis",
    schema: Schemas.IngredientAnalysisContentSchema,
  },
  NewsGrid: {
    dictionaryKey: "newsGrid",
    schema: Schemas.NewsGridContentSchema,
  },
  OrderSection: {
    dictionaryKey: "orderSection",
    schema: Schemas.OrderSectionContentSchema,
  },
  PricingSection: {
    dictionaryKey: "pricingSection",
    schema: Schemas.PricingSectionContentSchema,
  },
  ProductShowcase: {
    dictionaryKey: "productShowcase",
    schema: Schemas.ProductShowcaseContentSchema,
  },
  ScrollingBanner: {
    dictionaryKey: "scrollingBanner",
    schema: Schemas.ScrollingBannerContentSchema,
  },
  ServicesSection: {
    dictionaryKey: "servicesSection",
    schema: Schemas.ServicesSectionContentSchema,
  },
  SocialProofLogos: {
    dictionaryKey: "socialProofLogos",
    schema: Schemas.SocialProofLogosContentSchema,
  },
  SponsorsSection: {
    dictionaryKey: "sponsorsSection",
    schema: Schemas.SponsorsSectionContentSchema,
  },
  TeamSection: {
    dictionaryKey: "teamSection",
    schema: Schemas.TeamSectionContentSchema,
  },
  TestimonialCarouselSection: {
    dictionaryKey: "testimonialCarouselSection",
    schema: Schemas.TestimonialCarouselSectionContentSchema,
  },
  TestimonialGrid: {
    dictionaryKey: "testimonialGrid",
    schema: Schemas.TestimonialGridContentSchema,
  },
  TextSection: {
    dictionaryKey: "aboutPage",
    schema: z.object({ content: Schemas.ContentBlocksSchema }),
  },
  ThumbnailCarousel: {
    dictionaryKey: "thumbnailCarousel",
    schema: Schemas.ThumbnailCarouselContentSchema,
  },
  // Nota: ArticleBody no tiene contenido i18n, se pasa directamente
} as const satisfies Record<string, SectionMetadata>;

export type SectionName = keyof typeof sectionsConfig;
