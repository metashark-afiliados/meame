// RUTA: src/shared/lib/config/sections.config.ts
/**
 * @file sections.config.ts
 * @description SSoT para el registro de componentes de sección. Define el
 *              mapeo soberano entre un nombre de sección, su componente React,
 *              su clave de diccionario i18n y su contrato de datos (schema de Zod).
 * @version 27.0.0 (Contract Restoration & Full Component Mapping)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { logger } from "@/shared/lib/logging";
import * as Sections from "@/components/sections";
import type { ComponentType } from "react";

// --- Importaciones de todos los Schemas de Contenido ---
import { BenefitsSectionContentSchema } from "@/shared/lib/schemas/components/benefits-section.schema";
import { CommunitySectionContentSchema } from "@/shared/lib/schemas/components/community-section.schema";
import { ContactSectionContentSchema } from "@/shared/lib/schemas/components/contact-section.schema";
import { DoubleScrollingBannerContentSchema } from "@/shared/lib/schemas/components/double-scrolling-banner.schema";
import { FaqAccordionContentSchema } from "@/shared/lib/schemas/components/faq-accordion.schema";
import { FeaturedArticlesCarouselContentSchema } from "@/shared/lib/schemas/components/featured-articles-carousel.schema";
import { FeaturesSectionContentSchema } from "@/shared/lib/schemas/components/features-section.schema";
import { GuaranteeSectionContentSchema } from "@/shared/lib/schemas/components/guarantee-section.schema";
import { HeroContentSchema } from "@/shared/lib/schemas/components/hero.schema";
import { HeroNewsContentSchema } from "@/shared/lib/schemas/components/hero-news.schema";
import { IngredientAnalysisContentSchema } from "@/shared/lib/schemas/components/ingredient-analysis.schema";
import { NewsGridContentSchema } from "@/shared/lib/schemas/components/news-grid.schema";
import { OrderSectionContentSchema } from "@/shared/lib/schemas/components/order-section.schema";
import { PricingSectionContentSchema } from "@/shared/lib/schemas/components/pricing-section.schema";
import { ProductShowcaseContentSchema } from "@/shared/lib/schemas/components/product-showcase.schema";
import { ScrollingBannerContentSchema } from "@/shared/lib/schemas/components/scrolling-banner.schema";
import { ServicesSectionContentSchema } from "@/shared/lib/schemas/components/services-section.schema";
import { SocialProofLogosContentSchema } from "@/shared/lib/schemas/components/social-proof-logos.schema";
import { SponsorsSectionContentSchema } from "@/shared/lib/schemas/components/sponsors-section.schema";
import { TeamSectionContentSchema } from "@/shared/lib/schemas/components/team-section.schema";
import { TestimonialCarouselSectionContentSchema } from "@/shared/lib/schemas/components/testimonial-carousel-section.schema";
import { TestimonialGridContentSchema } from "@/shared/lib/schemas/components/testimonial-grid.schema";
import { TextPageContentSchema } from "@/shared/lib/schemas/pages/text-page.schema";
import { ThumbnailCarouselContentSchema } from "@/shared/lib/schemas/components/thumbnail-carousel.schema";
import { CommentSectionContentSchema } from "@/shared/lib/schemas/components/comment-section.schema";

logger.trace(
  "[sections.config.ts] Módulo de registro de secciones cargado (v27.0)."
);

interface SectionConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  dictionaryKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodObject<any>;
}

export const sectionsConfig = {
  BenefitsSection: {
    component: Sections.BenefitsSection,
    dictionaryKey: "benefitsSection",
    schema: BenefitsSectionContentSchema,
  },
  CommunitySection: {
    component: Sections.CommunitySection,
    dictionaryKey: "communitySection",
    schema: CommunitySectionContentSchema,
  },
  ContactSection: {
    component: Sections.ContactSection,
    dictionaryKey: "contactSection",
    schema: ContactSectionContentSchema,
  },
  DoubleScrollingBanner: {
    component: Sections.DoubleScrollingBanner,
    dictionaryKey: "doubleScrollingBanner",
    schema: DoubleScrollingBannerContentSchema,
  },
  FaqAccordion: {
    component: Sections.FaqAccordion,
    dictionaryKey: "faqAccordion",
    schema: FaqAccordionContentSchema,
  },
  FeaturedArticlesCarousel: {
    component: Sections.FeaturedArticlesCarousel,
    dictionaryKey: "featuredArticlesCarousel",
    schema: FeaturedArticlesCarouselContentSchema,
  },
  FeaturesSection: {
    component: Sections.FeaturesSection,
    dictionaryKey: "featuresSection",
    schema: FeaturesSectionContentSchema,
  },
  GuaranteeSection: {
    component: Sections.GuaranteeSection,
    dictionaryKey: "guaranteeSection",
    schema: GuaranteeSectionContentSchema,
  },
  Hero: {
    component: Sections.Hero,
    dictionaryKey: "hero",
    schema: HeroContentSchema,
  },
  HeroNews: {
    component: Sections.HeroNews,
    dictionaryKey: "heroNews",
    schema: HeroNewsContentSchema,
  },
  IngredientAnalysis: {
    component: Sections.IngredientAnalysis,
    dictionaryKey: "ingredientAnalysis",
    schema: IngredientAnalysisContentSchema,
  },
  NewsGrid: {
    component: Sections.NewsGrid,
    dictionaryKey: "newsGrid",
    schema: NewsGridContentSchema,
  },
  OrderSection: {
    component: Sections.OrderSection,
    dictionaryKey: "orderSection",
    schema: OrderSectionContentSchema,
  },
  PricingSection: {
    component: Sections.PricingSection,
    dictionaryKey: "pricingSection",
    schema: PricingSectionContentSchema,
  },
  ProductShowcase: {
    component: Sections.ProductShowcase,
    dictionaryKey: "productShowcase",
    schema: ProductShowcaseContentSchema,
  },
  ScrollingBanner: {
    component: Sections.ScrollingBanner,
    dictionaryKey: "scrollingBanner",
    schema: ScrollingBannerContentSchema,
  },
  ServicesSection: {
    component: Sections.ServicesSection,
    dictionaryKey: "servicesSection",
    schema: ServicesSectionContentSchema,
  },
  SocialProofLogos: {
    component: Sections.SocialProofLogos,
    dictionaryKey: "socialProofLogos",
    schema: SocialProofLogosContentSchema,
  },
  SponsorsSection: {
    component: Sections.SponsorsSection,
    dictionaryKey: "sponsorsSection",
    schema: SponsorsSectionContentSchema,
  },
  TeamSection: {
    component: Sections.TeamSection,
    dictionaryKey: "teamSection",
    schema: TeamSectionContentSchema,
  },
  TestimonialCarouselSection: {
    component: Sections.TestimonialCarouselSection,
    dictionaryKey: "testimonialCarouselSection",
    schema: TestimonialCarouselSectionContentSchema,
  },
  TestimonialGrid: {
    component: Sections.TestimonialGrid,
    dictionaryKey: "testimonialGrid",
    schema: TestimonialGridContentSchema,
  },
  TextSection: {
    component: Sections.TextSection,
    dictionaryKey: "aboutPage", // Clave de ejemplo, podría ser cualquiera que use TextPageContentSchema
    schema: z.object({ content: TextPageContentSchema.shape.content }),
  },
  ThumbnailCarousel: {
    component: Sections.ThumbnailCarousel,
    dictionaryKey: "thumbnailCarousel",
    schema: ThumbnailCarouselContentSchema,
  },
  ArticleBody: {
    component: Sections.ArticleBody,
    dictionaryKey: "articleBody", // Clave hipotética
    schema: z.object({ content: z.string() }),
  },
  CommentSection: {
    component: Sections.CommentSection,
    dictionaryKey: "commentSection",
    schema: CommentSectionContentSchema,
  },
} as const satisfies Record<string, SectionConfig>;

export type SectionName = keyof typeof sectionsConfig;
// RUTA: src/shared/lib/config/sections.config.ts
