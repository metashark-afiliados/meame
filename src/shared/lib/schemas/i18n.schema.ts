// Ruta correcta: src/shared/lib/schemas/i18n.schema.ts
/**
 * @file i18n.schema.ts
 * @description Aparato ensamblador y SSoT para el contrato del diccionario i18n.
 *              v30.0.0 (Architectural Integrity Restoration): Re-arquitecturado
 *              para usar `catchall` en lugar de `merge` para manejar de forma
 *              segura tanto claves estáticas como dinámicas. Corrige rutas de
 *              importación para alinearse con la SSoT de ubicación de schemas.
 * @version 30.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";

// --- GRUPO 1: Schemas Globales y de Páginas del Portal ---
import { GlobalsLocaleSchema } from "@/shared/lib/schemas/globals.schema";
import { StorePageLocaleSchema } from "@/shared/lib/schemas/pages/store-page.schema";
import { TextPageContentSchema } from "@/shared/lib/schemas/pages/text-page.schema";
import { NotFoundPageLocaleSchema } from "@/shared/lib/schemas/pages/not-found-page.schema";
import { ProductDetailPageContentSchema } from "@/shared/lib/schemas/pages/product-detail-page.schema";
import { NewsArticlePageContentSchema } from "@/shared/lib/schemas/pages/news-article-page.schema";

// --- GRUPO 2: Schemas de Páginas del Developer Command Center (DCC) ---
import { DevDashboardLocaleSchema } from "@/shared/lib/schemas/pages/dev-dashboard.schema";
import { DevLoginPageLocaleSchema } from "@/shared/lib/schemas/pages/dev-login-page.schema";
import { DevTestPageLocaleSchema } from "@/shared/lib/schemas/pages/dev-test-page.schema";
import { CampaignSuiteLocaleSchema } from "@/shared/lib/schemas/pages/dev-campaign-suite.schema";
import { BaviHomePageLocaleSchema } from "@/shared/lib/schemas/pages/bavi-home-page.schema";
import { BaviAssetExplorerLocaleSchema } from "@/shared/lib/schemas/pages/bavi-asset-explorer.i18n.schema";
import { RaZPromptsHomePageLocaleSchema } from "@/shared/lib/schemas/pages/raz-prompts-home-page.schema";
import { CinematicDemoPageLocaleSchema } from "@/shared/lib/schemas/pages/dev-cinematic-demo-page.schema";
import { CogniReadDashboardLocaleSchema } from "@/shared/lib/schemas/pages/cogniread-dashboard.schema";
import { CogniReadEditorLocaleSchema } from "@/shared/lib/schemas/pages/cogniread-editor.schema";
import { Nos3DashboardLocaleSchema } from "@/shared/lib/schemas/pages/nos3-dashboard.schema";

// --- GRUPO 3: Schemas de Componentes de Layout y UI ---
import { HeaderLocaleSchema } from "@/shared/lib/schemas/components/header.schema";
import { FooterLocaleSchema } from "@/shared/lib/schemas/components/footer.schema";
import { CookieConsentBannerLocaleSchema } from "@/shared/lib/schemas/components/cookie-consent-banner.schema";
import { DevHeaderLocaleSchema } from "@/shared/lib/schemas/components/dev/dev-header.schema";
import { DevHomepageHeaderLocaleSchema } from "@/shared/lib/schemas/components/dev/dev-homepage-header.schema";
import { DevRouteMenuLocaleSchema } from "@/shared/lib/schemas/components/dev/dev-route-menu.schema";
import { ToggleThemeLocaleSchema } from "@/shared/lib/schemas/components/toggle-theme.schema";
import { LanguageSwitcherLocaleSchema } from "@/shared/lib/schemas/components/language-switcher.schema";
import { PageHeaderLocaleSchema } from "@/shared/lib/schemas/components/page-header.schema";
import { CartLocaleSchema } from "@/shared/lib/schemas/components/cart.schema";
import { ValidationErrorLocaleSchema } from "@/shared/lib/schemas/components/validation-error.schema";
import { SuiteStyleComposerLocaleSchema } from "@/shared/lib/schemas/components/dev/suite-style-composer.schema";
import { ComponentCanvasHeaderLocaleSchema } from "@/shared/lib/schemas/components/dev/component-canvas-header.schema";
import { ComponentCanvasLocaleSchema } from "@/shared/lib/schemas/components/dev/component-canvas.schema";
import { ShareButtonLocaleSchema } from "@/shared/lib/schemas/components/share-button.schema";
import { AlertLocaleSchema } from "@/shared/lib/schemas/components/alert.schema";
import { AlertDialogLocaleSchema } from "@/shared/lib/schemas/components/alert-dialog.schema";

// --- GRUPO 4: Schemas de Componentes de Sección ---
import { BenefitsSectionLocaleSchema } from "@/shared/lib/schemas/components/benefits-section.schema";
import { CommunitySectionLocaleSchema } from "@/shared/lib/schemas/components/community-section.schema";
import { ContactSectionLocaleSchema } from "@/shared/lib/schemas/components/contact-section.schema";
import { DoubleScrollingBannerLocaleSchema } from "@/shared/lib/schemas/components/double-scrolling-banner.schema";
import { FaqAccordionLocaleSchema } from "@/shared/lib/schemas/components/faq-accordion.schema";
import { FeaturedArticlesCarouselLocaleSchema } from "@/shared/lib/schemas/components/featured-articles-carousel.schema";
import { FeaturesSectionLocaleSchema } from "@/shared/lib/schemas/components/features-section.schema";
import { GuaranteeSectionLocaleSchema } from "@/shared/lib/schemas/components/guarantee-section.schema";
import { HeroLocaleSchema } from "@/shared/lib/schemas/components/hero.schema";
import { HeroNewsLocaleSchema } from "@/shared/lib/schemas/components/hero-news.schema";
import { IngredientAnalysisLocaleSchema } from "@/shared/lib/schemas/components/ingredient-analysis.schema";
import { NewsGridLocaleSchema } from "@/shared/lib/schemas/components/news-grid.schema";
import { OrderSectionLocaleSchema } from "@/shared/lib/schemas/components/order-section.schema";
import { PricingSectionLocaleSchema } from "@/shared/lib/schemas/components/pricing-section.schema";
import { ProductShowcaseLocaleSchema } from "@/shared/lib/schemas/components/product-showcase.schema";
import { ScrollingBannerLocaleSchema } from "@/shared/lib/schemas/components/scrolling-banner.schema";
import { ServicesSectionLocaleSchema } from "@/shared/lib/schemas/components/services-section.schema";
import { SocialProofLogosLocaleSchema } from "@/shared/lib/schemas/components/social-proof-logos.schema";
import { SponsorsSectionLocaleSchema } from "@/shared/lib/schemas/components/sponsors-section.schema";
import { TeamSectionLocaleSchema } from "@/shared/lib/schemas/components/team-section.schema";
import { TestimonialCarouselSectionLocaleSchema } from "@/shared/lib/schemas/components/testimonial-carousel-section.schema";
import { TestimonialGridLocaleSchema } from "@/shared/lib/schemas/components/testimonial-grid.schema";
import { ThumbnailCarouselLocaleSchema } from "@/shared/lib/schemas/components/thumbnail-carousel.schema";
import { CommentSectionLocaleSchema } from "@/shared/lib/schemas/components/comment-section.schema";

// --- GRUPO 5: Schemas de Ecosistemas Adicionales ---
import { BaviUploaderLocaleSchema } from "@/shared/lib/schemas/bavi/bavi-uploader.i18n.schema";
import { PromptCreatorLocaleSchema } from "@/shared/lib/schemas/raz-prompts/prompt-creator.i18n.schema";
import { PromptVaultLocaleSchema } from "@/shared/lib/schemas/raz-prompts/prompt-vault.i18n.schema";
import { OrderConfirmationEmailLocaleSchema } from "@/shared/lib/schemas/emails/order-confirmation-email.schema";
// --- [INICIO DE CORRECCIÓN DE RUTA] ---
import { DockLocaleSchema } from "@/shared/lib/schemas/components/razBits/Dock/dock.schema";
import { LightRaysLocaleSchema } from "@/shared/lib/schemas/components/razBits/LightRays/light-rays.schema";
import { MagicBentoLocaleSchema } from "@/shared/lib/schemas/components/razBits/MagicBento/magic-bento.schema";
// --- [FIN DE CORRECCIÓN DE RUTA] ---

// 1. Base Schema: Contiene todas las claves ESTÁTICAS conocidas.
const baseStaticSchema = z.object({
  ...GlobalsLocaleSchema.shape,
  ...StorePageLocaleSchema.shape,
  ...NotFoundPageLocaleSchema.shape,
  aboutPage: TextPageContentSchema.optional(),
  privacyPage: TextPageContentSchema.optional(),
  termsPage: TextPageContentSchema.optional(),
  cookiesPage: TextPageContentSchema.optional(),
  ...DevDashboardLocaleSchema.shape,
  ...DevLoginPageLocaleSchema.shape,
  ...DevTestPageLocaleSchema.shape,
  ...CampaignSuiteLocaleSchema.shape,
  ...BaviHomePageLocaleSchema.shape,
  ...BaviAssetExplorerLocaleSchema.shape,
  ...RaZPromptsHomePageLocaleSchema.shape,
  ...CinematicDemoPageLocaleSchema.shape,
  ...CogniReadDashboardLocaleSchema.shape,
  ...CogniReadEditorLocaleSchema.shape,
  ...Nos3DashboardLocaleSchema.shape,
  ...HeaderLocaleSchema.shape,
  ...FooterLocaleSchema.shape,
  ...CookieConsentBannerLocaleSchema.shape,
  ...DevHeaderLocaleSchema.shape,
  ...DevHomepageHeaderLocaleSchema.shape,
  ...DevRouteMenuLocaleSchema.shape,
  ...ToggleThemeLocaleSchema.shape,
  ...LanguageSwitcherLocaleSchema.shape,
  ...PageHeaderLocaleSchema.shape,
  ...CartLocaleSchema.shape,
  ...ValidationErrorLocaleSchema.shape,
  ...SuiteStyleComposerLocaleSchema.shape,
  ...ComponentCanvasHeaderLocaleSchema.shape,
  ...ComponentCanvasLocaleSchema.shape,
  ...ShareButtonLocaleSchema.shape,
  ...AlertLocaleSchema.shape,
  ...AlertDialogLocaleSchema.shape,
  ...BenefitsSectionLocaleSchema.shape,
  ...CommunitySectionLocaleSchema.shape,
  ...ContactSectionLocaleSchema.shape,
  ...DoubleScrollingBannerLocaleSchema.shape,
  ...FaqAccordionLocaleSchema.shape,
  ...FeaturedArticlesCarouselLocaleSchema.shape,
  ...FeaturesSectionLocaleSchema.shape,
  ...GuaranteeSectionLocaleSchema.shape,
  ...HeroLocaleSchema.shape,
  ...HeroNewsLocaleSchema.shape,
  ...IngredientAnalysisLocaleSchema.shape,
  ...NewsGridLocaleSchema.shape,
  ...OrderSectionLocaleSchema.shape,
  ...PricingSectionLocaleSchema.shape,
  ...ProductShowcaseLocaleSchema.shape,
  ...ScrollingBannerLocaleSchema.shape,
  ...ServicesSectionLocaleSchema.shape,
  ...SocialProofLogosLocaleSchema.shape,
  ...SponsorsSectionLocaleSchema.shape,
  ...TeamSectionLocaleSchema.shape,
  ...TestimonialCarouselSectionLocaleSchema.shape,
  ...TestimonialGridLocaleSchema.shape,
  ...ThumbnailCarouselLocaleSchema.shape,
  ...CommentSectionLocaleSchema.shape,
  ...BaviUploaderLocaleSchema.shape,
  ...PromptCreatorLocaleSchema.shape,
  ...PromptVaultLocaleSchema.shape,
  ...DockLocaleSchema.shape,
  ...LightRaysLocaleSchema.shape,
  ...MagicBentoLocaleSchema.shape,
  ...OrderConfirmationEmailLocaleSchema.shape,
});

// 2. Dynamic Content Schemas: Define la forma del contenido para las páginas dinámicas.
const dynamicContentUnionSchema = z.union([
  ProductDetailPageContentSchema,
  NewsArticlePageContentSchema,
]);

// 3. Final Schema: Combina el schema base con un `catchall` para las claves dinámicas.
export const i18nSchema = baseStaticSchema.catchall(
  dynamicContentUnionSchema.optional()
);

export type Dictionary = z.infer<typeof i18nSchema>;
// Ruta correcta: src/shared/lib/schemas/i18n.schema.ts
