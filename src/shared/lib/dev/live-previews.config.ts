// RUTA: src/shared/lib/dev/live-previews.config.ts
/**
 * @file live-previews.config.ts
 * @description SSoT y registro de componentes para el renderizado en vivo en el EDVI.
 *              v2.0.0 (Architectural Realignment): Refactorizado para mapear a los
 *              componentes React reales en lugar de los renderizadores de OG Image,
 *              corrigiendo un error conceptual fundamental y restaurando la funcionalidad.
 * @version 2.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import type { ComponentType } from "react";
import { logger } from "@/shared/lib/logging";
import * as Sections from "@/components/sections";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

logger.trace(
  "[LivePreviewRegistry] Cargando registro de componentes para EDVI (v2.0)."
);

// Este mapa es la SSoT para el Entorno de Diseño Visual Integrado (EDVI).
// Mapea un string de identificación a un COMPONENTE REACT REAL que puede ser
// renderizado en el lienzo de previsualización en vivo.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const livePreviewComponentMap: Record<string, ComponentType<any>> = {
  // Componentes Estructurales
  StandardHeader: Header,
  MinimalHeader: Header, // Usamos el mismo por ahora, se puede diferenciar con props
  StandardFooter: Footer,

  // Componentes de Sección
  BenefitsSection: Sections.BenefitsSection,
  CommunitySection: Sections.CommunitySection,
  ContactSection: Sections.ContactSection,
  DoubleScrollingBanner: Sections.DoubleScrollingBanner,
  FaqAccordion: Sections.FaqAccordion,
  FeaturedArticlesCarousel: Sections.FeaturedArticlesCarousel,
  FeaturesSection: Sections.FeaturesSection,
  GuaranteeSection: Sections.GuaranteeSection,
  Hero: Sections.Hero,
  HeroNews: Sections.HeroNews,
  IngredientAnalysis: Sections.IngredientAnalysis,
  NewsGrid: Sections.NewsGrid,
  OrderSection: Sections.OrderSection,
  PricingSection: Sections.PricingSection,
  ProductShowcase: Sections.ProductShowcase,
  ServicesSection: Sections.ServicesSection,
  SocialProofLogos: Sections.SocialProofLogos,
  SponsorsSection: Sections.SponsorsSection,
  TeamSection: Sections.TeamSection,
  TestimonialCarouselSection: Sections.TestimonialCarouselSection,
  TestimonialGrid: Sections.TestimonialGrid,
  TextSection: Sections.TextSection,
  ThumbnailCarousel: Sections.ThumbnailCarousel,
};
// RUTA: src/shared/lib/dev/live-previews.config.ts
