// RUTA: src/shared/lib/config/sections.config.ts
/**
 * @file sections.config.ts
 * @description SSoT Soberana para el registro de METADATOS y COMPONENTES de sección.
 *              Este manifiesto es la única fuente de verdad que mapea un nombre de
 *              sección a su schema, clave de diccionario y componente de React.
 * @version 29.0.0 (Sovereign Component Registry)
 *@author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import type { ComponentType } from "react";
import { logger } from "@/shared/lib/logging";
import * as Schemas from "@/shared/lib/schemas/components";
import * as Sections from "@/components/sections";

logger.trace(
  "[sections.config.ts] Manifiesto soberano de secciones cargado (v29.0)."
);

/**
 * @interface SectionMetadata
 * @description El contrato inmutable para una entrada en el registro de secciones.
 *              Define todo lo necesario para renderizar, validar y editar una sección.
 */
interface SectionMetadata {
  /** La clave para encontrar el contenido de esta sección en el diccionario i18n. */
  readonly dictionaryKey: string;
  /** El schema de Zod para validar el objeto de contenido de esta sección. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly schema: z.ZodObject<any>;
  /** Una referencia directa al componente de React que renderiza esta sección. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly component: ComponentType<any>;
}

export const sectionsConfig = {
  BenefitsSection: {
    dictionaryKey: "benefitsSection",
    schema: Schemas.BenefitsSectionContentSchema,
    component: Sections.BenefitsSection,
  },
  CommunitySection: {
    dictionaryKey: "communitySection",
    schema: Schemas.CommunitySectionContentSchema,
    component: Sections.CommunitySection,
  },
  CommentSection: {
    dictionaryKey: "commentSection",
    schema: Schemas.CommentSectionContentSchema,
    component: Sections.CommentSection,
  },
  ContactSection: {
    dictionaryKey: "contactSection",
    schema: Schemas.ContactSectionContentSchema,
    component: Sections.ContactSection,
  },
  DoubleScrollingBanner: {
    dictionaryKey: "doubleScrollingBanner",
    schema: Schemas.DoubleScrollingBannerContentSchema,
    component: Sections.DoubleScrollingBanner,
  },
  FaqAccordion: {
    dictionaryKey: "faqAccordion",
    schema: Schemas.FaqAccordionContentSchema,
    component: Sections.FaqAccordion,
  },
  FeaturedArticlesCarousel: {
    dictionaryKey: "featuredArticlesCarousel",
    schema: Schemas.FeaturedArticlesCarouselContentSchema,
    component: Sections.FeaturedArticlesCarousel,
  },
  FeaturesSection: {
    dictionaryKey: "featuresSection",
    schema: Schemas.FeaturesSectionContentSchema,
    component: Sections.FeaturesSection,
  },
  GuaranteeSection: {
    dictionaryKey: "guaranteeSection",
    schema: Schemas.GuaranteeSectionContentSchema,
    component: Sections.GuaranteeSection,
  },
  Hero: {
    dictionaryKey: "hero",
    schema: Schemas.HeroContentSchema,
    component: Sections.Hero,
  },
  HeroNews: {
    dictionaryKey: "heroNews",
    schema: Schemas.HeroNewsContentSchema,
    component: Sections.HeroNews,
  },
  IngredientAnalysis: {
    dictionaryKey: "ingredientAnalysis",
    schema: Schemas.IngredientAnalysisContentSchema,
    component: Sections.IngredientAnalysis,
  },
  NewsGrid: {
    dictionaryKey: "newsGrid",
    schema: Schemas.NewsGridContentSchema,
    component: Sections.NewsGrid,
  },
  OrderSection: {
    dictionaryKey: "orderSection",
    schema: Schemas.OrderSectionContentSchema,
    component: Sections.OrderSection,
  },
  PricingSection: {
    dictionaryKey: "pricingSection",
    schema: Schemas.PricingSectionContentSchema,
    component: Sections.PricingSection,
  },
  ProductShowcase: {
    dictionaryKey: "productShowcase",
    schema: Schemas.ProductShowcaseContentSchema,
    component: Sections.ProductShowcase,
  },
  ScrollingBanner: {
    dictionaryKey: "scrollingBanner",
    schema: Schemas.ScrollingBannerContentSchema,
    component: Sections.ScrollingBanner,
  },
  ServicesSection: {
    dictionaryKey: "servicesSection",
    schema: Schemas.ServicesSectionContentSchema,
    component: Sections.ServicesSection,
  },
  SocialProofLogos: {
    dictionaryKey: "socialProofLogos",
    schema: Schemas.SocialProofLogosContentSchema,
    component: Sections.SocialProofLogos,
  },
  SponsorsSection: {
    dictionaryKey: "sponsorsSection",
    schema: Schemas.SponsorsSectionContentSchema,
    component: Sections.SponsorsSection,
  },
  TeamSection: {
    dictionaryKey: "teamSection",
    schema: Schemas.TeamSectionContentSchema,
    component: Sections.TeamSection,
  },
  TestimonialCarouselSection: {
    dictionaryKey: "testimonialCarouselSection",
    schema: Schemas.TestimonialCarouselSectionContentSchema,
    component: Sections.TestimonialCarouselSection,
  },
  TestimonialGrid: {
    dictionaryKey: "testimonialGrid",
    schema: Schemas.TestimonialGridContentSchema,
    component: Sections.TestimonialGrid,
  },
  TextSection: {
    dictionaryKey: "aboutPage", // Ejemplo, puede variar
    schema: z.object({ content: Schemas.ContentBlocksSchema }),
    component: Sections.TextSection,
  },
  ThumbnailCarousel: {
    dictionaryKey: "thumbnailCarousel",
    schema: Schemas.ThumbnailCarouselContentSchema,
    component: Sections.ThumbnailCarousel,
  },
} as const satisfies Record<string, SectionMetadata>;

export type SectionName = keyof typeof sectionsConfig;
