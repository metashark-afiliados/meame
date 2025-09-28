// RUTA: src/components/features/dev-tools/config/live-previews.config.ts
/**
 * @file live-previews.config.ts
 * @description SSoT y Guardián de Frontera para el registro de componentes del EDVI.
 * @version 13.0.0 (Definitive Boundary Enforcement)
 * @author RaZ Podestá - MetaShark Tech
 */
import type { ComponentType } from "react";
import { logger } from "@/shared/lib/logging";
logger.trace(
  "[LivePreviewRegistry] Cargando registro DEFINITIVO para EDVI (v13.0)."
);

// --- [INICIO DE CORRECCIÓN DE RAÍZ] ---
// Se importan EXCLUSIVAMENTE los componentes de CLIENTE que son seguros para la vista previa.
import HeaderClient from "@/components/layout/HeaderClient";
import { HeroClient } from "@/components/sections/HeroClient";
import { SocialProofLogosClient } from "@/components/sections/SocialProofLogosClient";
import { CommentSectionClient } from "@/components/sections/comments/CommentSectionClient";
// --- [FIN DE CORRECCIÓN DE RAÍZ] ---

// ... el resto de componentes que ya eran seguros ...
import { Footer } from "@/components/layout/Footer";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { CommunitySection } from "@/components/sections/CommunitySection";
import { ContactSection } from "@/components/sections/ContactSection";
import { DoubleScrollingBanner } from "@/components/sections/DoubleScrollingBanner";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { FeaturedArticlesCarousel } from "@/components/sections/FeaturedArticlesCarousel";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { GuaranteeSection } from "@/components/sections/GuaranteeSection";
import { HeroNews } from "@/components/sections/HeroNews";
import { IngredientAnalysis } from "@/components/sections/IngredientAnalysis";
import { NewsGrid } from "@/components/sections/NewsGrid";
import { OrderSection } from "@/components/sections/OrderSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { SponsorsSection } from "@/components/sections/SponsorsSection";
import { TeamSection } from "@/components/sections/TeamSection";
import { TestimonialCarouselSection } from "@/components/sections/TestimonialCarouselSection";
import { TestimonialGrid } from "@/components/sections/TestimonialGrid";
import { TextSection } from "@/components/sections/TextSection";
import { ThumbnailCarousel } from "@/components/sections/ThumbnailCarousel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const livePreviewComponentMap: Record<string, ComponentType<any>> = {
  // --- MUTACIÓN CLAVE ---
  // El mapa ahora apunta a los componentes de CLIENTE.
  StandardHeader: HeaderClient,
  MinimalHeader: HeaderClient,
  Hero: HeroClient,
  SocialProofLogos: SocialProofLogosClient,
  CommentSection: CommentSectionClient,
  // --- RESTO DEL MAPA ---
  StandardFooter: Footer,
  BenefitsSection: BenefitsSection,
  CommunitySection: CommunitySection,
  ContactSection: ContactSection,
  DoubleScrollingBanner: DoubleScrollingBanner,
  FaqAccordion: FaqAccordion,
  FeaturedArticlesCarousel: FeaturedArticlesCarousel,
  FeaturesSection: FeaturesSection,
  GuaranteeSection: GuaranteeSection,
  HeroNews: HeroNews,
  IngredientAnalysis: IngredientAnalysis,
  NewsGrid: NewsGrid,
  OrderSection: OrderSection,
  PricingSection: PricingSection,
  ProductShowcase: ProductShowcase,
  ServicesSection: ServicesSection,
  SponsorsSection: SponsorsSection,
  TeamSection: TeamSection,
  TestimonialCarouselSection: TestimonialCarouselSection,
  TestimonialGrid: TestimonialGrid,
  TextSection: TextSection,
  ThumbnailCarousel: ThumbnailCarousel,
};
