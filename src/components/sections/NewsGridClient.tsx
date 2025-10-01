// RUTA: src/components/sections/NewsGridClient.tsx (NUEVO ARCHIVO)
/**
 * @file NewsGridClient.tsx
 * @description Componente de cliente puro ("Client Core") para renderizar la cuadrícula de noticias.
 * @version 1.0.0
 *@author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { motion } from "framer-motion";
import { Container, DynamicIcon } from "@/components/ui";
import { routes } from "@/shared/lib/navigation";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

export interface EnrichedArticle {
  id: string;
  title: string;
  summary: string;
  slug: string;
  publicId?: string;
}

interface NewsGridClientProps {
  articles: EnrichedArticle[];
  locale: Locale;
  content: NonNullable<Dictionary["newsGrid"]>;
}

// ... (variantes de animación aquí, sin cambios) ...

export function NewsGridClient({
  articles,
  locale,
  content,
}: NewsGridClientProps) {
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
          // ... (props de motion)
        >
          {articles.map((article) => (
            <motion.div key={article.id} /*...*/>
              <Link
                href={routes.newsBySlug.path({ locale, slug: article.slug })}
                className="block group"
              >
                <div className="overflow-hidden rounded-lg ...">
                  <div className="relative w-full h-48 bg-muted/50">
                    {article.publicId ? (
                      <CldImage
                        src={article.publicId}
                        alt={article.title}
                        width={400}
                        height={225}
                        // ... (otras props de CldImage)
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <DynamicIcon name="ImageOff" size={48} />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-lg font-bold text-primary flex-grow">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                      {article.summary}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
