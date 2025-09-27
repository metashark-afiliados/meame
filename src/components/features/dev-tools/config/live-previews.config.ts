// RUTA: src/components/features/dev-tools/config/live-previews.config.ts
/**
 * @file live-previews.config.ts
 * @description SSoT para el registro de componentes SEGUROS PARA EL CLIENTE para el EDVI.
 * @version 8.0.0 (Build Integrity Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
import type { ComponentType } from "react";
import { logger } from "@/shared/lib/logging";

logger.trace(
  "[LivePreviewRegistry] Cargando registro para EDVI (v8.0 - Build-Ready)."
);

// --- [INICIO DE CORRECCIÓN DE BUILD TS2614] ---
// Se corrige la importación de HeaderClient para usar la sintaxis de exportación por defecto.
import HeaderClient from "@/components/layout/HeaderClient";
// --- [FIN DE CORRECCIÓN DE BUILD TS2614] ---
import { Footer } from "@/components/layout/Footer";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { CommunitySection } from "@/components/sections/CommunitySection";
import { ContactSection } from "@/components/sections/ContactSection";
import { DoubleScrollingBanner } from "@/components/sections/DoubleScrollingBanner";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { FeaturedArticlesCarousel } from "@/components/sections/FeaturedArticlesCarousel";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { GuaranteeSection } from "@/components/sections/GuaranteeSection";
import { HeroClient } from "@/components/sections/HeroClient";
import { HeroNews } from "@/components/sections/HeroNews";
import { IngredientAnalysis } from "@/components/sections/IngredientAnalysis";
import { NewsGrid } from "@/components/sections/NewsGrid";
import { OrderSection } from "@/components/sections/OrderSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { SocialProofLogosClient } from "@/components/sections/SocialProofLogosClient";
import { SponsorsSection } from "@/components/sections/SponsorsSection";
import { TeamSection } from "@/components/sections/TeamSection";
import { TestimonialCarouselSection } from "@/components/sections/TestimonialCarouselSection";
import { TestimonialGrid } from "@/components/sections/TestimonialGrid";
import { TextSection } from "@/components/sections/TextSection";
import { ThumbnailCarousel } from "@/components/sections/ThumbnailCarousel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const livePreviewComponentMap: Record<string, ComponentType<any>> = {
  StandardHeader: HeaderClient,
  MinimalHeader: HeaderClient, // Reutiliza el cliente, la variante se maneja con props
  StandardFooter: Footer,
  BenefitsSection,
  CommunitySection,
  ContactSection,
  DoubleScrollingBanner,
  FaqAccordion,
  FeaturedArticlesCarousel,
  FeaturesSection,
  GuaranteeSection,
  Hero: HeroClient,
  HeroNews,
  IngredientAnalysis,
  NewsGrid,
  OrderSection,
  PricingSection,
  ProductShowcase,
  ServicesSection,
  SocialProofLogos: SocialProofLogosClient,
  SponsorsSection,
  TeamSection,
  TestimonialCarouselSection,
  TestimonialGrid,
  TextSection,
  ThumbnailCarousel,
};
