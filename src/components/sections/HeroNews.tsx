// RUTA: src/components/sections/HeroNews.tsx
/**
 * @file HeroNews.tsx
 * @description Sección Hero para la página de noticias, ahora dinámica.
 * @version 4.0.0 (Dynamic CogniRead & BAVI Integration)
 *@author RaZ Podestá - MetaShark Tech - Asistente de Refactorización
 */
"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { CldImage } from "next-cloudinary";
import { Container, DynamicIcon } from "@/components/ui";
import { logger } from "@/shared/lib/logging";
import { routes } from "@/shared/lib/navigation";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { CogniReadArticle } from "@/shared/lib/schemas/cogniread/article.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";

type HeroNewsContent = NonNullable<Dictionary["heroNews"]>;

interface HeroNewsProps {
  content: HeroNewsContent;
  article?: CogniReadArticle; // El artículo dinámico es ahora una prop opcional
  locale?: Locale;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const FADE_UP_ANIMATION_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 },
  },
};

export function HeroNews({ content, article, locale }: HeroNewsProps) {
  logger.info("[HeroNews] Renderizando v4.0 (Dynamic & BAVI Integrated).");

  // Lógica de datos: Determina si usar datos dinámicos del artículo o estáticos del i18n.
  const articleContent = article && locale ? article.content[locale] : null;
  const featuredArticleData = {
    tag: content.featuredArticle.tag,
    title: articleContent?.title || content.featuredArticle.title,
    author:
      article?.studyDna.authors.join(", ") || content.featuredArticle.author,
    readTime: content.featuredArticle.readTime, // Podríamos hacerlo dinámico en el futuro
    slug: articleContent?.slug || "#",
    baviHeroImageId: article?.baviHeroImageId,
  };

  return (
    <motion.section
      variants={sectionVariants}
      className="relative overflow-hidden pt-24 pb-12 sm:pt-32 sm:pb-16 text-center"
    >
      {/* Integración con BAVI: El fondo se renderiza dinámicamente si el artículo lo proporciona */}
      {featuredArticleData.baviHeroImageId && (
        <CldImage
          src={featuredArticleData.baviHeroImageId}
          alt={featuredArticleData.title}
          fill
          className="object-cover z-0 opacity-10"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-0" />

      <Container className="relative z-10">
        <motion.div
          initial="hidden"
          animate="show"
          viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.2 } } }}
        >
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground"
            variants={FADE_UP_ANIMATION_VARIANTS}
          >
            {content.mainTitle}
          </motion.h1>

          <motion.div
            className="mt-16 mx-auto max-w-2xl"
            variants={FADE_UP_ANIMATION_VARIANTS}
          >
            <Link
              href={
                locale
                  ? routes.newsBySlug.path({
                      locale,
                      slug: featuredArticleData.slug,
                    })
                  : "#"
              }
              className="block group"
            >
              <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 text-left shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1.5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-accent">
                    {featuredArticleData.tag}
                  </span>
                  <DynamicIcon
                    name="ArrowRight"
                    className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
                  />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-primary mb-2">
                  {featuredArticleData.title}
                </h2>
                <p className="text-sm text-muted-foreground">{`Por ${featuredArticleData.author} · ${featuredArticleData.readTime} min de lectura`}</p>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </motion.section>
  );
}
