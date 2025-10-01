// RUTA: src/components/layout/SectionRenderer.tsx
/**
 * @file SectionRenderer.tsx
 * @description Motor de renderizado de secciones de élite. Mapea dinámicamente
 *              los nombres de sección a sus componentes, inyectando contenido
 *              validado. Forjado con observabilidad granular, resiliencia holística
 *              y seguridad de tipos absoluta.
 * @version 24.0.0 (Type-Safe & Elite Hygiene)
 *@author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { forwardRef } from "react";
import { motion, type Variants } from "framer-motion";
import { logger } from "@/shared/lib/logging";
import { sectionsConfig } from "@/shared/lib/config/sections.config";
import {
  BenefitsSection,
  CommunitySection,
  ContactSection,
  DoubleScrollingBanner,
  FaqAccordion,
  FeaturedArticlesCarousel,
  FeaturesSection,
  GuaranteeSection,
  Hero,
  HeroNews,
  IngredientAnalysis,
  NewsGrid,
  OrderSection,
  PricingSection,
  ProductShowcase,
  ServicesSection,
  SocialProofLogos,
  SponsorsSection,
  TeamSection,
  TestimonialCarouselSection,
  TestimonialGrid,
  TextSection,
  ThumbnailCarousel,
  ScrollingBanner,
  CommentSection,
} from "@/components/sections";
import { ValidationError } from "@/components/ui/ValidationError";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { DeveloperErrorDisplay } from "../features/dev-tools";

const componentMap = {
  BenefitsSection,
  CommunitySection,
  ContactSection,
  DoubleScrollingBanner,
  FaqAccordion,
  FeaturedArticlesCarousel,
  FeaturesSection,
  GuaranteeSection,
  Hero,
  HeroNews,
  IngredientAnalysis,
  NewsGrid,
  OrderSection,
  PricingSection,
  ProductShowcase,
  ScrollingBanner,
  ServicesSection,
  SocialProofLogos,
  SponsorsSection,
  TeamSection,
  TestimonialCarouselSection,
  TestimonialGrid,
  TextSection,
  ThumbnailCarousel,
  CommentSection,
};

interface SectionRendererProps {
  sections: { name: string }[];
  dictionary: Dictionary;
  locale: Locale;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// --- [INICIO DE CORRECCIÓN DE TIPO DE REF (TS2322)] ---
// Se especifica que el ref será para un HTMLDivElement, que es el tipo
// del motion.div, resolviendo la incompatibilidad de tipos.
export const SectionRenderer = forwardRef<HTMLDivElement, SectionRendererProps>(
  ({ sections, dictionary, locale }, ref) => {
    // --- [FIN DE CORRECCIÓN DE TIPO DE REF] ---
    const traceId = logger.startTrace("SectionRenderer_v24.0");
    logger.startGroup(
      `[SectionRenderer] Renderizando ${sections.length} secciones...`
    );

    if (!dictionary || !dictionary.validationError) {
      const errorMessage =
        "El diccionario o el contenido de 'validationError' no están disponibles.";
      logger.error(`[Guardián de Resiliencia] ${errorMessage}`, { traceId });
      logger.endGroup();
      logger.endTrace(traceId);
      return process.env.NODE_ENV === "development" ? (
        <DeveloperErrorDisplay
          context="SectionRenderer"
          errorMessage={errorMessage}
        />
      ) : null;
    }

    try {
      return (
        <motion.div ref={ref} initial="hidden" animate="visible" variants={{}}>
          {sections.map((section, index) => {
            const sectionTraceId = `${traceId}:${section.name}:${index}`;
            logger.startGroup(
              `  -> Procesando sección: ${section.name}`,
              `traceId: ${sectionTraceId}`
            );

            const config =
              sectionsConfig[section.name as keyof typeof sectionsConfig];
            const Component =
              componentMap[section.name as keyof typeof componentMap];

            if (!config || !Component) {
              logger.warn(
                `[Guardián] Componente o configuración para la sección "${section.name}" no encontrado. Omitiendo.`,
                { traceId: sectionTraceId }
              );
              logger.endGroup();
              return null;
            }
            logger.traceEvent(
              sectionTraceId,
              "Configuración y componente de sección encontrados."
            );

            const contentData = (dictionary as Record<string, unknown>)[
              config.dictionaryKey
            ];
            const validation = config.schema.safeParse(contentData);

            if (!validation.success) {
              logger.error(
                `[Guardián] Fallo de validación de datos para la sección "${section.name}".`,
                {
                  errors: validation.error.flatten(),
                  traceId: sectionTraceId,
                }
              );
              logger.endGroup();
              return (
                <ValidationError
                  key={`${section.name}-${index}-error`}
                  sectionName={section.name}
                  error={validation.error}
                  content={dictionary.validationError!}
                />
              );
            }
            logger.traceEvent(
              sectionTraceId,
              "Datos de contenido validados con éxito."
            );

            const componentProps = {
              content: validation.data,
              locale: locale,
            };

            logger.success(
              `[SectionRenderer] Renderizando sección "${section.name}" con éxito.`
            );
            logger.endGroup();
            return (
              <motion.div
                key={`${section.name}-${index}`}
                variants={sectionVariants}
              >
                {/*
                  [JUSTIFICACIÓN DE 'any' EXPLÍCITO]
                  La aserción de tipo es deliberada y aceptada en este único punto.
                  Es el núcleo de un renderizador dinámico donde las props son heterogéneas
                  por diseño. La seguridad de tipos está garantizada por la validación
                  explícita con Zod que se realiza inmediatamente antes, mitigando
                  el riesgo de pasar props incorrectas. Esta es una excepción
                  controlada y documentada a la regla de "no-explicit-any".
                */}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Component {...(componentProps as any)} />
              </motion.div>
            );
          })}
        </motion.div>
      );
    } finally {
      logger.endGroup();
      logger.endTrace(traceId);
    }
  }
);
SectionRenderer.displayName = "SectionRenderer";
