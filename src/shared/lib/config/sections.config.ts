// RUTA: src/shared/lib/config/sections.config.ts
/**
 * @file sections.config.ts
 * @description SSoT Soberana para el registro de METADATOS y COMPONENTES de sección.
 *              v31.0.0 (Heterogeneous Component Typing): Refactorizado para manejar
 *              correctamente un registro de componentes con diferentes firmas de props,
 *              resolviendo errores de tipo TS2322 de forma arquitectónicamente sólida.
 * @version 31.0.0
 * @author L.I.A. Legacy
 */
import { z } from "zod";
import type { ComponentType } from "react";
import { logger } from "@/shared/lib/logging";
import * as Schemas from "@/shared/lib/schemas/components";
import * as Sections from "@/components/sections";
import type { SectionProps } from "@/shared/lib/types/sections.types";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

logger.trace(
  "[sections.config.ts] Manifiesto soberano de secciones cargado (v31.0)."
);

interface SectionMetadata {
  readonly dictionaryKey: keyof Dictionary;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly schema: z.ZodObject<any>;
  // --- [INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
  // Se relaja el tipo para aceptar cualquier componente de React. La seguridad de tipos
  // se delega al consumidor de este registro, que tiene el contexto completo.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly component: ComponentType<any>;
  // --- [FIN DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
}

// Se define un tipo "puente" para los componentes que SÍ cumplen el contrato base.
type StandardSectionComponent = ComponentType<SectionProps<keyof Dictionary>>;

export const sectionsConfig = {
  BenefitsSection: {
    dictionaryKey: "benefitsSection",
    schema: Schemas.BenefitsSectionContentSchema,
    component: Sections.BenefitsSection as unknown as StandardSectionComponent,
  },
  CommunitySection: {
    dictionaryKey: "communitySection",
    schema: Schemas.CommunitySectionContentSchema,
    component: Sections.CommunitySection as unknown as StandardSectionComponent,
  },
  CommentSection: {
    dictionaryKey: "commentSection",
    schema: Schemas.CommentSectionContentSchema,
    component: Sections.CommentSection, // Este componente tiene props únicas
  },
  ContactSection: {
    dictionaryKey: "contactSection",
    schema: Schemas.ContactSectionContentSchema,
    component: Sections.ContactSection as unknown as StandardSectionComponent,
  },
  DoubleScrollingBanner: {
    dictionaryKey: "doubleScrollingBanner",
    schema: Schemas.DoubleScrollingBannerContentSchema,
    component:
      Sections.DoubleScrollingBanner as unknown as StandardSectionComponent,
  },
  FaqAccordion: {
    dictionaryKey: "faqAccordion",
    schema: Schemas.FaqAccordionContentSchema,
    component: Sections.FaqAccordion as unknown as StandardSectionComponent,
  },
  FeaturedArticlesCarousel: {
    dictionaryKey: "featuredArticlesCarousel",
    schema: Schemas.FeaturedArticlesCarouselContentSchema,
    component:
      Sections.FeaturedArticlesCarousel as unknown as StandardSectionComponent,
  },
  FeaturesSection: {
    dictionaryKey: "featuresSection",
    schema: Schemas.FeaturesSectionContentSchema,
    component: Sections.FeaturesSection as unknown as StandardSectionComponent,
  },
  GuaranteeSection: {
    dictionaryKey: "guaranteeSection",
    schema: Schemas.GuaranteeSectionContentSchema,
    component: Sections.GuaranteeSection as unknown as StandardSectionComponent,
  },
  Hero: {
    dictionaryKey: "hero",
    schema: Schemas.HeroContentSchema,
    component: Sections.Hero, // Este es un Server Shell con props únicas
  },
  HeroNews: {
    dictionaryKey: "heroNews",
    schema: Schemas.HeroNewsContentSchema,
    component: Sections.HeroNews as unknown as StandardSectionComponent,
  },
  IngredientAnalysis: {
    dictionaryKey: "ingredientAnalysis",
    schema: Schemas.IngredientAnalysisContentSchema,
    component:
      Sections.IngredientAnalysis as unknown as StandardSectionComponent,
  },
  NewsGrid: {
    dictionaryKey: "newsGrid",
    schema: Schemas.NewsGridContentSchema,
    component: Sections.NewsGrid, // Este componente tiene la prop 'articles'
  },
  OrderSection: {
    dictionaryKey: "orderSection",
    schema: Schemas.OrderSectionContentSchema,
    component: Sections.OrderSection as unknown as StandardSectionComponent,
  },
  PricingSection: {
    dictionaryKey: "pricingSection",
    schema: Schemas.PricingSectionContentSchema,
    component: Sections.PricingSection as unknown as StandardSectionComponent,
  },
  ProductShowcase: {
    dictionaryKey: "productShowcase",
    schema: Schemas.ProductShowcaseContentSchema,
    component: Sections.ProductShowcase as unknown as StandardSectionComponent,
  },
  ScrollingBanner: {
    dictionaryKey: "scrollingBanner",
    schema: Schemas.ScrollingBannerContentSchema,
    component: Sections.ScrollingBanner as unknown as StandardSectionComponent,
  },
  ServicesSection: {
    dictionaryKey: "servicesSection",
    schema: Schemas.ServicesSectionContentSchema,
    component: Sections.ServicesSection as unknown as StandardSectionComponent,
  },
  SocialProofLogos: {
    dictionaryKey: "socialProofLogos",
    schema: Schemas.SocialProofLogosContentSchema,
    component: Sections.SocialProofLogos, // Este es un Server Shell
  },
  SponsorsSection: {
    dictionaryKey: "sponsorsSection",
    schema: Schemas.SponsorsSectionContentSchema,
    component: Sections.SponsorsSection as unknown as StandardSectionComponent,
  },
  TeamSection: {
    dictionaryKey: "teamSection",
    schema: Schemas.TeamSectionContentSchema,
    component: Sections.TeamSection as unknown as StandardSectionComponent,
  },
  TestimonialCarouselSection: {
    dictionaryKey: "testimonialCarouselSection",
    schema: Schemas.TestimonialCarouselSectionContentSchema,
    component:
      Sections.TestimonialCarouselSection as unknown as StandardSectionComponent,
  },
  TestimonialGrid: {
    dictionaryKey: "testimonialGrid",
    schema: Schemas.TestimonialGridContentSchema,
    component: Sections.TestimonialGrid as unknown as StandardSectionComponent,
  },
  TextSection: {
    dictionaryKey: "aboutPage", // Ejemplo, puede variar
    schema: z.object({ content: Schemas.ContentBlocksSchema }),
    component: Sections.TextSection as unknown as StandardSectionComponent,
  },
  ThumbnailCarousel: {
    dictionaryKey: "thumbnailCarousel",
    schema: Schemas.ThumbnailCarouselContentSchema,
    component:
      Sections.ThumbnailCarousel as unknown as StandardSectionComponent,
  },
} as const satisfies Record<string, SectionMetadata>;

export type SectionName = keyof typeof sectionsConfig;
