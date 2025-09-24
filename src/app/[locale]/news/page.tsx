// app/[locale]/news/page.tsx
/**
 * @file page.tsx
 * @description Página de archivo del blog, ahora alimentada por CogniRead.
 * @version 3.0.0 (CogniRead Integration)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { PageHeader } from "@/components/layout/PageHeader";
import { NewsGrid } from "@/components/sections/NewsGrid";
import { CommunitySection } from "@/components/sections/CommunitySection";
import { DeveloperErrorDisplay } from "@/components/dev";
import { getPublishedArticlesAction } from "../(dev)/cogniread/_actions";
import { notFound } from "next/navigation";

interface NewsArchivePageProps {
  params: { locale: Locale };
}

export default async function NewsArchivePage({
  params: { locale },
}: NewsArchivePageProps) {
  logger.info(
    `[NewsArchivePage] Renderizando v3.0 (CogniRead) para locale: ${locale}`
  );

  // Cargar contenido estático de la UI (títulos, etc.)
  const { dictionary, error: dictError } = await getDictionary(locale);
  const pageContent = dictionary.newsGrid; // Reutilizamos el i18n para el header
  const communityContent = dictionary.communitySection;

  if (dictError || !pageContent) {
    // ... (Manejo de errores para el diccionario)
    return notFound();
  }

  // Cargar artículos dinámicos desde la base de datos
  const articlesResult = await getPublishedArticlesAction({
    page: 1,
    limit: 9,
  });

  if (!articlesResult.success) {
    return (
      <DeveloperErrorDisplay
        context="NewsArchivePage"
        errorMessage="No se pudieron cargar los artículos desde CogniRead."
        errorDetails={articlesResult.error}
      />
    );
  }

  return (
    <>
      <PageHeader content={pageContent} />

      {/* Pasamos los artículos reales al componente NewsGrid */}
      <NewsGrid articles={articlesResult.data.articles} locale={locale} />

      {communityContent && <CommunitySection content={communityContent} />}
    </>
  );
}
// app/[locale]/news/page.tsx
