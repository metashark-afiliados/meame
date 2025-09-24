// components/sections/TestimonialCarouselSection.tsx
/**
 * @file TestimonialCarouselSection.tsx
 * @description Componente de sección para mostrar testimonios en un formato de carrusel interactivo.
 *              - v1.1.0: Iconografía estandarizada.
 *              - v1.2.0 (Resilience): La prop `content` ahora es opcional.
 * @version 1.2.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import { Card, CardContent } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { DynamicIcon } from "@/components/ui";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { ReviewItem } from "@/shared/lib/schemas/components/testimonial-carousel-section.schema";

interface TestimonialCarouselSectionProps {
  // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
  content?: Dictionary["testimonialCarouselSection"];
  // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---
}

const StarRating = ({ rating }: { rating: number }) => {
  logger.trace("[Observabilidad] Renderizando StarRating");
  return (
    <div className="flex gap-1 text-yellow-500">
      {[...Array(5)].map((_, i) => (
        <DynamicIcon
          key={i}
          name="Star"
          className="w-4 h-4"
          fill={i < rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
};

export function TestimonialCarouselSection({
  content,
}: TestimonialCarouselSectionProps): React.ReactElement | null {
  logger.info("[Observabilidad] Renderizando TestimonialCarouselSection");

  // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
  if (!content) {
    logger.warn(
      "[TestimonialCarouselSection] No se proporcionó contenido. La sección no se renderizará."
    );
    return null;
  }
  // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---

  const { eyebrow, title, reviews } = content;

  return (
    <section id="testimonials-carousel" className="py-24 sm:py-32">
      <Container className="text-center">
        <h2 className="text-lg text-primary mb-2 tracking-wider">{eyebrow}</h2>
        <h3 className="text-3xl md:text-4xl font-bold mb-12">{title}</h3>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-4xl mx-auto"
        >
          <CarouselContent>
            {reviews.map((review: ReviewItem, index: number) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="h-full">
                    <CardContent className="flex flex-col items-center justify-center text-center p-6">
                      <Image
                        src={review.image}
                        alt={`Avatar de ${review.name}`}
                        width={80}
                        height={80}
                        className="w-20 h-20 mb-4 rounded-full"
                      />
                      <p className="text-muted-foreground text-md mb-4 h-24">
                        &quot;{review.comment}&quot;
                      </p>
                      <StarRating rating={review.rating} />
                      <cite className="mt-4 not-italic">
                        <span className="block font-semibold text-foreground">
                          {review.name}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {review.userName}
                        </span>
                      </cite>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </Container>
    </section>
  );
}
// components/sections/TestimonialCarouselSection.tsx
