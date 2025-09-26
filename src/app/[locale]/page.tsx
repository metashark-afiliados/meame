// RUTA: src/app/[locale]/page.tsx
/**
 * @file page.tsx
 * @description Página de inicio del portal, ahora dinámica y alimentada por CogniRead.
 * @version 3.0.0 (CogniRead Dynamic Data Integration)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { HeroNews } from "@/components/sections/HeroNews";
import { NewsGrid } from "@/components/sections/NewsGrid";
import { SocialProofLogos } from "@/components/sections/SocialProofLogos";
import { CommunitySection } from "@/components/sections/CommunitySection";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { getPublishedArticlesAction } from "@/shared/lib/actions/cogniread";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { SectionAnimator } from "@/components/layout/SectionAnimator";

interface HomePageProps {
  params: { locale: Locale };
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  logger.info(`[HomePage] Renderizando v3.0 (Dynamic) para locale: ${locale}`);

  // Obtenemos el contenido estático y los artículos dinámicos en paralelo
  const [{ dictionary }, articlesResult] = await Promise.all([
    getDictionary(locale),
    getPublishedArticlesAction({ page: 1, limit: 3 }), // Obtenemos los 3 más recientes
  ]);

  const { heroNews, socialProofLogos, communitySection, newsGrid } = dictionary;

  if (!articlesResult.success) {
    return (
      <DeveloperErrorDisplay
        context="HomePage"
        errorMessage="No se pudieron cargar los artículos desde CogniRead."
        errorDetails={articlesResult.error}
      />
    );
  }

  return (
    <SectionAnimator>
      {heroNews && <HeroNews content={heroNews} />}
      {socialProofLogos && <SocialProofLogos content={socialProofLogos} />}

      {newsGrid && (
        <NewsGrid
          articles={articlesResult.data.articles}
          locale={locale}
          content={newsGrid}
        />
      )}

      {communitySection && <CommunitySection content={communitySection} />}
    </SectionAnimator>
  );
}
