// RUTA: src/components/sections/index.ts
/**
 * @file index.ts (Barrel File)
 * @description Fachada pública soberana y purificada para el módulo de
 *              componentes de sección genéricos.
 * @version 3.0.0 (Architectural Purity & Cohesion)
 * @author RaZ Podestá - MetaShark Tech
 */

// Exporta únicamente componentes que son secciones de página reutilizables.
export * from "./BenefitsSection";
export * from "./CommunitySection";
export * from "./ContactSection";
export * from "./DoubleScrollingBanner";
export * from "./FaqAccordion";
export * from "./FeaturedArticlesCarousel";
export * from "./FeaturesSection";
export * from "./GuaranteeSection";
export * from "./Hero";
export * from "./HeroClient";
export * from "./HeroNews";
export * from "./IngredientAnalysis";
export * from "./NewsGrid";
export * from "./OrderSection";
export * from "./PricingSection";
export * from "./ProductShowcase";
export * from "./ServicesSection";
export * from "./SocialProofLogos";
export * from "./SponsorsSection";
export * from "./TeamSection";
export * from "./TestimonialCarouselSection";
export * from "./TestimonialGrid";
export * from "./TextSection";
export * from "./ThumbnailCarousel";
export * from "./ArticleBody";
export * from "./CommentSection";
export * from "./ScrollingBanner"; 
// Los componentes especializados como ProductGrid, ProductFilters, etc.,
// ya no se exportan desde aquí para mantener una alta cohesión del módulo.
