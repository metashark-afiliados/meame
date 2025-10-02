// RUTA: src/app/[locale]/(public)/page.tsx
/**
 * @file page.tsx
 * @description Homepage del portal, actuando como un "Ensamblador de Servidor"
 *              de élite, ahora con importaciones quirúrgicas y soberanas.
 * @version 16.0.0 (Surgical Imports & Barrel File Eradication)
 * @author L.I.A. Legacy
 */
import React from "react";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { SectionAnimator } from "@/components/layout/SectionAnimator";
// --- [INICIO DE REFACTORIZACIÓN POR ERRADICACIÓN] ---
// Se reemplaza la importación del barrel file por importaciones directas.
import { SocialProofLogos } from "@/components/sections/SocialProofLogos";
import { CommunitySection } from "@/components/sections/CommunitySection";
import { ScrollingBanner } from "@/components/sections/ScrollingBanner";
import { HeroNews } from "@/components/sections/HeroNews";
import { NewsGrid } from "@/components/sections/NewsGrid";
// --- [FIN DE REFACTORIZACIÓN POR ERRADICACIÓN] ---
import { getPublishedArticlesAction } from "@/shared/lib/actions/cogniread";
import type { CogniReadArticle } from "@/shared/lib/schemas/cogniread/article.schema";

interface HomePageProps {
  params: { locale: Locale };
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  const traceId = logger.startTrace("HomePage_Render_v16.0");
  logger.startGroup(
    `[HomePage Shell] Renderizando v16.0 para locale: ${locale}`
  );

  try {
    const [{ dictionary, error: dictError }, articlesResult] =
      await Promise.all([
        getDictionary(locale),
        getPublishedArticlesAction({ page: 1, limit: 4 }),
      ]);

    const {
      socialProofLogos,
      communitySection,
      scrollingBanner,
      heroNews,
      newsGrid,
    } = dictionary;

    if (
      dictError ||
      !socialProofLogos ||
      !communitySection ||
      !scrollingBanner ||
      !heroNews ||
      !newsGrid
    ) {
      const missingKeys = [
        !socialProofLogos && "socialProofLogos",
        !communitySection && "communitySection",
        !scrollingBanner && "scrollingBanner",
        !heroNews && "heroNews",
        !newsGrid && "newsGrid",
      ]
        .filter(Boolean)
        .join(", ");

      throw new Error(
        `Faltan una o más claves de i18n esenciales. Claves ausentes: ${missingKeys}`
      );
    }

    if (!articlesResult.success) {
      if (process.env.NODE_ENV === "development") {
        return (
          <DeveloperErrorDisplay
            context="HomePage Data Fetching"
            errorMessage="Fallo al obtener artículos publicados desde la base de datos."
            errorDetails={articlesResult.error}
          />
        );
      }
      logger.error(
        "[HomePage Shell] No se pudieron obtener los artículos de CogniRead en producción.",
        { error: articlesResult.error, traceId }
      );
    }

    const articles: CogniReadArticle[] = articlesResult.success
      ? articlesResult.data.articles
      : [];
    const featuredArticle = articles[0];
    const gridArticles = articles.slice(1, 4);

    return (
      <SectionAnimator>
        <ScrollingBanner content={scrollingBanner} locale={locale} />
        <SocialProofLogos content={socialProofLogos} locale={locale} />
        {featuredArticle && (
          <HeroNews
            content={heroNews}
            article={featuredArticle}
            locale={locale}
          />
        )}
        {gridArticles.length > 0 && (
          <NewsGrid
            articles={gridArticles}
            locale={locale}
            content={newsGrid}
          />
        )}
        <CommunitySection content={communitySection} locale={locale} />
      </SectionAnimator>
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(`[HomePage Shell] ${errorMessage}`, { error: error, traceId });
    return (
      <DeveloperErrorDisplay
        context="HomePage Server Shell"
        errorMessage="Fallo crítico al renderizar el Server Shell del Homepage."
        errorDetails={error instanceof Error ? error : errorMessage}
      />
    );
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}
