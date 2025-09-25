// app/[locale]/news/[slug]/page.tsx
/**
 * @file page.tsx
 * @description Página de artículo de blog individual. SSoT para la visualización de
 *              contenido de CogniRead. Orquesta la obtención de datos del servidor y
 *              la composición de componentes de élite para renderizar el artículo completo,
 *              incluyendo la sección de comentarios interactiva.
 * @version 3.1.0 (Holistic Type Safety & Elite Compliance)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { notFound } from "next/navigation";
import { CldImage } from "next-cloudinary";
import type { Metadata } from "next";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArticleBody, CommentSection } from "@/components/sections";
import { DeveloperErrorDisplay } from "@/components/dev";
import { SectionAnimator } from "@/components/layout/SectionAnimator";
import {
  getArticleBySlugAction,
  getPublishedArticlesAction,
} from "@/shared/lib/actions/cogniread";
import type { CogniReadArticle } from "@/shared/lib/schemas/cogniread/article.schema";

/**
 * @interface NewsArticlePageProps
 * @description Contrato de props para la página de artículo, proporcionado por Next.js.
 */
interface NewsArticlePageProps {
  params: { locale: Locale; slug: string };
}

/**
 * @function generateStaticParams
 * @description SSoT para la Generación de Sitios Estáticos (SSG). Descubre todos los
 *              artículos publicados en todos los idiomas en tiempo de build y genera
 *              las rutas estáticas correspondientes para un rendimiento de carga óptimo.
 * @returns {Promise<{ locale: Locale; slug: string }[]>} Un array de objetos de parámetros para cada página a pre-renderizar.
 */
export async function generateStaticParams(): Promise<
  { locale: Locale; slug: string }[]
> {
  logger.info(
    "[SSG] Iniciando generación de parámetros estáticos para artículos..."
  );
  const result = await getPublishedArticlesAction({ page: 1, limit: 100 });
  if (!result.success) {
    logger.error(
      "[SSG] No se pudieron obtener los artículos para generateStaticParams."
    );
    return [];
  }

  // Se añade tipado explícito a los argumentos para erradicar 'any' implícito.
  const paths = result.data.articles.flatMap((article: CogniReadArticle) =>
    Object.entries(article.content).map(([locale, content]) => ({
      locale: locale as Locale,
      slug: (content as { slug: string }).slug,
    }))
  );

  logger.success(
    `[SSG] Se generarán ${paths.length} rutas de artículo estáticas.`
  );
  return paths;
}

/**
 * @function generateMetadata
 * @description Genera los metadatos SEO (título y descripción) para la página del artículo
 *              de forma dinámica en el servidor.
 * @param {NewsArticlePageProps} props - Las props de la página.
 * @returns {Promise<Metadata>} El objeto de metadatos para el <head> de la página.
 */
export async function generateMetadata({
  params: { locale, slug },
}: NewsArticlePageProps): Promise<Metadata> {
  const articleResult = await getArticleBySlugAction(slug, locale);
  if (!articleResult.success || !articleResult.data.article) {
    return {
      title: "Artículo no encontrado",
      description: "La página que buscas no existe o ha sido movida.",
    };
  }
  const content = articleResult.data.article.content[locale];
  return {
    title: content?.title,
    description: content?.summary,
    openGraph: {
      title: content?.title,
      description: content?.summary,
      images: articleResult.data.article.baviHeroImageId
        ? [
            {
              url: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,g_auto,w_1200,h_630/${articleResult.data.article.baviHeroImageId}`,
              width: 1200,
              height: 630,
              alt: content?.title,
            },
          ]
        : [],
    },
  };
}

/**
 * @component NewsArticlePage
 * @description El Server Component principal para la página de un artículo.
 * @param {NewsArticlePageProps} props - Las props de la página.
 * @returns {Promise<React.ReactElement>} El elemento JSX de la página.
 */
export default async function NewsArticlePage({
  params: { locale, slug },
}: NewsArticlePageProps): Promise<React.ReactElement> {
  logger.info(
    `[NewsArticlePage] Renderizando v3.1 (Elite) para slug: "${slug}", locale: ${locale}`
  );

  const articleResult = await getArticleBySlugAction(slug, locale);

  if (!articleResult.success) {
    return (
      <DeveloperErrorDisplay
        context="NewsArticlePage"
        errorMessage={`No se pudo cargar el artículo [slug: ${slug}].`}
        errorDetails={articleResult.error}
      />
    );
  }

  if (!articleResult.data.article) {
    return notFound();
  }

  const { article } = articleResult.data;
  const content = article.content[locale];

  if (!content) {
    logger.warn(
      `[NewsArticlePage] No se encontró traducción para el locale '${locale}' en el artículo '${article.articleId}'.`
    );
    return notFound();
  }

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
// app/[locale]/news/[slug]/page.tsx
