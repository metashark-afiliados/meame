// RUTA: src/shared/lib/config/sections.config.ts
/**
 * @file sections.config.ts
 * @description SSoT para la configuración de secciones. Define el mapeo entre
 *              un nombre de sección, su clave de diccionario i18n y su contrato
 *              de datos (schema de Zod).
 * @version 25.0.0 (Holistic & Complete)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { logger } from "@/shared/lib/logging";

// --- Importaciones de Schemas Soberanos ---
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

logger.trace("[sections.config.ts] Módulo de configuración de secciones cargado (v25.0).");

export const sectionsConfig = {
  BenefitsSection: {
    dictionaryKey: "benefitsSection",
    schema: BenefitsSectionContentSchema,
  },
  CommunitySection: {
    dictionaryKey: "communitySection",
    schema: CommunitySectionContentSchema,
  },
  ContactSection: {
    dictionaryKey: "contactSection",
    schema: ContactSectionContentSchema,
  },
  DoubleScrollingBanner: {
    dictionaryKey: "doubleScrollingBanner",
    schema: DoubleScrollingBannerContentSchema,
  },
  FaqAccordion: {
    dictionaryKey: "faqAccordion",
    schema: FaqAccordionContentSchema,
  },
  FeaturedArticlesCarousel: {
    dictionaryKey: "featuredArticlesCarousel",
    schema: FeaturedArticlesCarouselContentSchema,
  },
  FeaturesSection: {
    dictionaryKey: "featuresSection",
    schema: FeaturesSectionContentSchema,
  },
  GuaranteeSection: {
    dictionaryKey: "guaranteeSection",
    schema: GuaranteeSectionContentSchema,
  },
  Hero: {
    dictionaryKey: "hero",
    schema: HeroContentSchema,
  },
  HeroNews: {
    dictionaryKey: "heroNews",
    schema: HeroNewsContentSchema,
  },
  IngredientAnalysis: {
    dictionaryKey: "ingredientAnalysis",
    schema: IngredientAnalysisContentSchema,
  },
  NewsGrid: {
    dictionaryKey: "newsGrid",
    schema: NewsGridContentSchema,
  },
  OrderSection: {
    dictionaryKey: "orderSection",
    schema: OrderSectionContentSchema,
  },
  PricingSection: {
    dictionaryKey: "pricingSection",
    schema: PricingSectionContentSchema,
  },
  ProductShowcase: {
    dictionaryKey: "productShowcase",
    schema: ProductShowcaseContentSchema,
  },
  ScrollingBanner: {
    dictionaryKey: "scrollingBanner",
    schema: ScrollingBannerContentSchema,
  },
  ServicesSection: {
    dictionaryKey: "servicesSection",
    schema: ServicesSectionContentSchema,
  },
  SocialProofLogos: {
    dictionaryKey: "socialProofLogos",
    schema: SocialProofLogosContentSchema,
  },
  SponsorsSection: {
    dictionaryKey: "sponsorsSection",
    schema: SponsorsSectionContentSchema,
  },
  TeamSection: {
    dictionaryKey: "teamSection",
    schema: TeamSectionContentSchema,
  },
  TestimonialCarouselSection: {
    dictionaryKey: "testimonialCarouselSection",
    schema: TestimonialCarouselSectionContentSchema,
  },
  TestimonialGrid: {
    dictionaryKey: "testimonialGrid",
    schema: TestimonialGridContentSchema,
  },
  TextSection: {
    dictionaryKey: "aboutPage", // Clave de ejemplo, ya que es genérico
    schema: z.object({ content: TextPageContentSchema.shape.content }),
  },
  ThumbnailCarousel: {
    dictionaryKey: "thumbnailCarousel",
    schema: ThumbnailCarouselContentSchema,
  },
  // --- ENTRADAS RESTAURADAS Y NIVELADAS ---
  ArticleBody: {
    dictionaryKey: "articleBody", // Clave hipotética, el contenido se pasa directamente
    schema: z.object({ content: z.string() }),
  },
  CommentSection: {
    dictionaryKey: "commentSection",
    schema: CommentSectionContentSchema,
  },
} as const;

export type SectionName = keyof typeof sectionsConfig;
// RUTA: src/shared/lib/config/sections.config.ts
