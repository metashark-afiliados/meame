// RUTA: src/app/[locale]/news/[slug]/page.tsx
/**
 * @file page.tsx
 * @description Página de artículo de blog, ahora blindada con un Guardián de Resiliencia
 *              Verboso y con observabilidad de élite inyectada.
 * @version 4.0.0 (Resilient & Observable)
 *@author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { notFound } from "next/navigation";
import { CldImage } from "next-cloudinary";
import type { Metadata } from "next";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArticleBody, CommentSection } from "@/components/sections";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { SectionAnimator } from "@/components/layout/SectionAnimator";
import {
  getArticleBySlugAction,
  getPublishedArticlesAction,
} from "@/shared/lib/actions/cogniread";
import type { CogniReadArticle } from "@/shared/lib/schemas/cogniread/article.schema";

interface NewsArticlePageProps {
  params: { locale: Locale; slug: string };
}

export async function generateStaticParams(): Promise<
  { locale: Locale; slug: string }[]
> {
  const result = await getPublishedArticlesAction({ page: 1, limit: 100 });
  if (!result.success) return [];
  const paths = result.data.articles.flatMap((article: CogniReadArticle) =>
    Object.entries(article.content).map(([locale, content]) => ({
      locale: locale as Locale,
      slug: (content as { slug: string }).slug,
    }))
  );
  return paths;
}

export async function generateMetadata({
  params: { locale, slug },
}: NewsArticlePageProps): Promise<Metadata> {
  const articleResult = await getArticleBySlugAction(slug, locale);
  if (!articleResult.success || !articleResult.data.article) {
    return { title: "Artículo no encontrado" };
  }
  const content = articleResult.data.article.content[locale];
  return {
    title: content?.title,
    description: content?.summary,
  };
}

export default async function NewsArticlePage({
  params: { locale, slug },
}: NewsArticlePageProps): Promise<React.ReactElement> {
  const traceId = logger.startTrace(`NewsArticlePage:${slug}`);
  logger.info(
    `[Observabilidad][SERVIDOR] Renderizando NewsArticlePage v4.0 para slug: "${slug}", locale: ${locale}`,
    { traceId }
  );

  const articleResult = await getArticleBySlugAction(slug, locale);

  if (!articleResult.success) {
    logger.error(`[Guardián de Resiliencia] Fallo la obtención del artículo.`, {
      error: articleResult.error,
      traceId,
    });
    return (
      <DeveloperErrorDisplay
        context="NewsArticlePage"
        errorMessage={`No se pudo cargar el artículo [slug: ${slug}].`}
        errorDetails={articleResult.error}
      />
    );
  }

  if (!articleResult.data.article) {
    logger.warn(
      `[Guardián de Resiliencia] Artículo no encontrado para slug: "${slug}". Renderizando 404.`,
      { traceId }
    );
    return notFound();
  }

  const { article } = articleResult.data;
  const content = article.content[locale];

  // --- INICIO DEL GUARDIÁN DE RESILIENCIA VERBOSO ---
  if (!content || !content.title || !content.summary || !content.body) {
    const errorMessage = `El contenido para el locale '${locale}' en el artículo '${article.articleId}' está incompleto o ausente.`;
    logger.error(`[Guardián de Resiliencia] ${errorMessage}`, {
      articleId: article.articleId,
      locale,
      traceId,
    });
    // En producción, esto mostrará una página 404, lo cual es el comportamiento correcto.
    return notFound();
  }
  // --- FIN DEL GUARDIÁN DE RESILIENCIA VERBOSO ---

  logger.success(
    `[NewsArticlePage] Datos validados. Procediendo a renderizar.`,
    { traceId }
  );
  logger.endTrace(traceId);

  return (
    <>
      <PageHeader
        content={{ title: content.title, subtitle: content.summary }}
      />
      <SectionAnimator>
        {article.baviHeroImageId && (
          <div className="relative w-full aspect-video max-w-5xl mx-auto -mt-16 rounded-lg overflow-hidden shadow-lg z-10">
            <CldImage
              src={article.baviHeroImageId}
              alt={content.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1280px"
              priority
            />
          </div>
        )}
        <ArticleBody content={content.body} />
      </SectionAnimator>
      <CommentSection articleId={article.articleId} articleSlug={slug} />
    </>
  );
}
