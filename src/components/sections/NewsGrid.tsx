// RUTA: src/components/sections/NewsGrid.tsx
/**
 * @file NewsGrid.tsx
 * @description Cuadrícula de noticias, ahora data-driven desde CogniRead, con
 *              seguridad de tipos y rutas de importación soberanas.
 * @version 7.1.0 (Definitive Build Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { motion, type Variants } from "framer-motion";
import { Container, DynamicIcon } from "@/components/ui";
import { routes } from "@/shared/lib/navigation";
// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
import { type Locale } from "@/shared/lib/i18n/i18n.config";
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---
import type { CogniReadArticle } from "@/shared/lib/schemas/cogniread/article.schema";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

interface NewsGridProps {
  articles: CogniReadArticle[];
  locale: Locale;
  content: NonNullable<Dictionary["newsGrid"]>;
}

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function NewsGrid({
  articles,
  locale,
  content,
}: NewsGridProps): React.ReactElement {
  logger.info("[NewsGrid] Renderizando v7.1 (Definitive Build Fix).");

  return (
    <section className="py-16 sm:py-24 bg-background">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">{content.title}</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        </div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {articles.map((article) => {
            // --- [INICIO DE GUARDIA DE TIPO RESILIENTE] ---
            const articleContent = article.content[locale];
            if (!articleContent) {
              logger.warn(
                `[NewsGrid] No se encontró traducción para el locale '${locale}' en el artículo '${article.articleId}'. Se omite el renderizado.`
              );
              return null; // Omite este artículo si no hay contenido para el idioma actual.
            }
            // --- [FIN DE GUARDIA DE TIPO RESILIENTE] ---

            return (
              <motion.div key={article.articleId} variants={cardVariants}>
                <Link
                  href={routes.newsBySlug.path({
                    locale,
                    slug: articleContent.slug,
                  })}
                  className="block group"
                >
                  <div className="overflow-hidden rounded-lg shadow-lg border border-border bg-card h-full flex flex-col transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1">
                    <div className="relative w-full h-48 bg-muted/50">
                      {article.baviHeroImageId ? (
                        <CldImage
                          src={article.baviHeroImageId}
                          alt={articleContent.title}
                          width={400}
                          height={225}
                          crop="fill"
                          gravity="auto"
                          format="auto"
                          quality="auto"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <DynamicIcon name="ImageOff" size={48} />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-lg font-bold text-primary flex-grow">
                        {articleContent.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                        {articleContent.summary}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
