// RUTA: components/sections/Hero.tsx
/**
 * @file Hero.tsx
 * @description Componente de presentación para la sección Hero.
 *              v9.1.0 (Holistic Elite Compliance): Refactorizado a un Componente
 *              de Cliente que utiliza `forwardRef`. Participa en la animación
 *              orquestada por `SectionAnimator` y cumple con los 7 Pilares de Calidad.
 * @version 9.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { forwardRef } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/shared/lib/utils/cn";
import { Container } from "@/components/ui/Container";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

/**
 * @interface HeroProps
 * @description Contrato de props para el componente Hero, incluyendo `isFocused` para
 *              el modo de edición de la SDC.
 */
interface HeroProps {
  content: NonNullable<Dictionary["hero"]>;
  isFocused?: boolean;
}

/**
 * @const sectionVariants
 * @description Define la animación de entrada para la sección, que será disparada
 *              en cascada por el `SectionAnimator` padre.
 */
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1], // Curva de easing profesional para un efecto suave
    },
  },
};

/**
 * @const titleContainerVariants
 * @description Orquesta la animación de las palabras del título.
 */
const titleContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Un ligero retraso entre cada palabra
      delayChildren: 0.2,
    },
  },
};

/**
 * @const wordVariants
 * @description Anima cada palabra individualmente con un efecto de resorte.
 */
const wordVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
};

/**
 * @const subtitleVariants
 * @description Anima la entrada del subtítulo después del título.
 */
const subtitleVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      delay: 0.6, // Aparece después de que el título ha comenzado a animarse
    },
  },
};

/**
 * @component Hero
 * @description Renderiza la sección de cabecera principal de una página. Utiliza `forwardRef`
 *              para permitir que el `SectionRenderer` le pase una `ref` para la
 *              funcionalidad de "Modo Foco".
 */
export const Hero = forwardRef<HTMLElement, HeroProps>(
  ({ content, isFocused }, ref) => {
    logger.info("[Hero] Renderizando v9.1 (Holistic Elite Compliance).");

    if (!content) {
      logger.warn("[Hero] No se proporcionó contenido. No se renderizará.");
      return null;
    }

    const { title, subtitle } = content;
    const titleWords = title.split(" ");

    return (
      <motion.section
        ref={ref}
        variants={sectionVariants}
        id="hero"
        className={cn(
          "bg-background pt-8 pb-16 text-center overflow-hidden transition-all duration-300 rounded-lg",
          // Efecto visual para el "Modo Foco" en la SDC
          isFocused &&
            "ring-2 ring-primary ring-offset-4 ring-offset-background"
        )}
        aria-labelledby="hero-title"
      >
        <Container className="max-w-4xl">
          <motion.h1
            id="hero-title"
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight font-serif text-primary drop-shadow-md"
            aria-label={title}
            variants={titleContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {titleWords.map((word: string, index: number) => (
              <motion.span
                key={`${word}-${index}`}
                className="inline-block"
                variants={wordVariants}
                style={{ marginRight: "0.25em" }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p
            className="mt-6 text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto"
            variants={subtitleVariants}
            initial="hidden"
            animate="visible"
          >
            {subtitle}
          </motion.p>
        </Container>
      </motion.section>
    );
  }
);

Hero.displayName = "Hero";
