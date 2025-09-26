// RUTA: src/app/[locale]/news/page.tsx
/**
 * @file page.tsx
 * @description Página de archivo del blog, ahora alimentada por CogniRead y
 *              arquitectónicamente soberana.
 * @version 4.0.0 (Holistic Integrity Restoration)
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
import { getPublishedArticlesAction } from "@/shared/lib/actions/cogniread"; // <-- RUTA CORREGIDA
import { notFound } from "next/navigation";

interface NewsArchivePageProps {
  params: { locale: Locale };
}

export default async function NewsArchivePage({
  params: { locale },
}: NewsArchivePageProps) {
  logger.info(
    `[NewsArchivePage] Renderizando v4.0 (Holistic) para locale: ${locale}`
  );

  // Cargar contenido estático y artículos dinámicos en paralelo
  const [{ dictionary, error: dictError }, articlesResult] = await Promise.all([
    getDictionary(locale),
    getPublishedArticlesAction({
      page: 1,
      limit: 9,
    }),
  ]);

  const pageContent = dictionary.newsGrid;
  const communityContent = dictionary.communitySection;

  // --- Guardia de Resiliencia para Contenido i18n ---
  if (dictError || !pageContent) {
    const errorMessage = "Fallo al cargar el contenido i18n para la página de noticias.";
    logger.error(`[NewsArchivePage] ${errorMessage}`, { error: dictError });
    if (process.env.NODE_ENV === "production") return notFound();
    return (
        <DeveloperErrorDisplay
            context="NewsArchivePage"
            errorMessage={errorMessage}
            errorDetails={dictError || "La clave 'newsGrid' falta en el diccionario."}
        />
    );
  }

  // --- Guardia de Resiliencia para Datos Dinámicos ---
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

      {/* --- CONTRATO DE PROPS CUMPLIDO --- */}
      <NewsGrid
        articles={articlesResult.data.articles}
        locale={locale}
        content={pageContent}
      />

      {communityContent && <CommunitySection content={communityContent} />}
    </>
  );
}
