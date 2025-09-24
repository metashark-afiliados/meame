// components/sections/ThumbnailCarousel.tsx
/**
 * @file ThumbnailCarousel.tsx
 * @description Un carrusel visual que cicla a través de una serie de imágenes.
 * @version 5.2.0 (Code Hygiene)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

interface ThumbnailCarouselProps {
  content?: Dictionary["thumbnailCarousel"];
  interval?: number;
}

export function ThumbnailCarousel({
  content,
  interval = 5000,
}: ThumbnailCarouselProps): React.ReactElement | null {
  logger.info("[ThumbnailCarousel] Renderizando componente v5.2...");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const thumbnails = useMemo(() => content?.thumbnails || [], [content]);

  const nextSlide = useCallback(() => {
    if (thumbnails.length > 1) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % thumbnails.length);
    }
  }, [thumbnails.length]);

  useEffect(() => {
    if (thumbnails.length <= 1 || isHovered) {
      return;
    }
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [currentIndex, thumbnails.length, interval, isHovered, nextSlide]);

  if (!content || thumbnails.length === 0) {
    logger.warn("[ThumbnailCarousel] Contenido inválido. No se renderizará.");
    return null;
  }

  const { affiliateUrl, playButtonAriaLabel, playButtonTitle } = content;
  const currentThumbnail = thumbnails[currentIndex];

  return (
    <section
      className="py-16 sm:py-24"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Container className="max-w-4xl">
        <div className="relative aspect-video w-full group rounded-lg overflow-hidden border-4 border-foreground/10 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out hover:-translate-y-1">
          <AnimatePresence mode="wait">
            {currentThumbnail && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0.8, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.8, scale: 1.05 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={currentThumbnail.src}
                  alt={currentThumbnail.alt}
                  fill
                  className="object-cover"
                  priority={currentIndex === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 896px"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center transition-opacity duration-300 group-hover:bg-foreground/20">
            <Button
              href={affiliateUrl}
              className="p-0 bg-transparent shadow-none hover:scale-110 transition-transform duration-300 focus-visible:ring-0 focus-visible:ring-offset-0"
              aria-label={playButtonAriaLabel}
            >
              <div className="bg-black/50 rounded-full p-4 sm:p-6 backdrop-blur-sm">
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 text-foreground"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <title>{playButtonTitle}</title>
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
                </svg>
              </div>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
