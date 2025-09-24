// RUTA: shared/lib/config/sections.config.ts
/**
 * @file sections.config.ts
 * @description SSoT para la configuración de secciones. Define el mapeo entre
 *              un nombre de sección, su componente React, su clave de diccionario
 *              i18n y su contrato de datos (schema de Zod).
 * @version 24.0.0 (Build Stability Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import * as Sections from "@/components/sections";

// Se importan todos los schemas necesarios...
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
import { ServicesSectionContentSchema } from "@/shared/lib/schemas/components/services-section.schema";
import { SocialProofLogosContentSchema } from "@/shared/lib/schemas/components/social-proof-logos.schema";
import { SponsorsSectionContentSchema } from "@/shared/lib/schemas/components/sponsors-section.schema";
import { TeamSectionContentSchema } from "@/shared/lib/schemas/components/team-section.schema";
import { TestimonialCarouselSectionContentSchema } from "@/shared/lib/schemas/components/testimonial-carousel-section.schema";
import { TestimonialGridContentSchema } from "@/shared/lib/schemas/components/testimonial-grid.schema";
import { TextPageContentSchema } from "@/shared/lib/schemas/pages/text-page.schema";
import { ThumbnailCarouselContentSchema } from "@/shared/lib/schemas/components/thumbnail-carousel.schema";

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
    dictionaryKey: "aboutPage",
    schema: z.object({ content: TextPageContentSchema.shape.content }),
  },
  ThumbnailCarousel: {
    component: Sections.ThumbnailCarousel,
    dictionaryKey: "thumbnailCarousel",
    schema: ThumbnailCarouselContentSchema,
  },
  // La entrada de 'CommentSection' ha sido eliminada.
} as const;

export type SectionName = keyof typeof sectionsConfig;
