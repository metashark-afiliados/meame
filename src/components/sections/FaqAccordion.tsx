// RUTA: components/sections/FaqAccordion.tsx
/**
 * @file FaqAccordion.tsx
 * @description Sección de Preguntas Frecuentes (FAQ). Nivelada a un estándar de
 *              élite, consumiendo el nuevo sistema de Acordeón composicional y animado.
 *              Resuelve el error de tipo TS2322 de forma arquitectónica.
 * @version 7.0.0 (Elite & Compositional)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client"; // Necesario para el componente Accordion interactivo

import React, { forwardRef } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { logger } from "@/shared/lib/logging";
import { cn } from "@/shared/lib/utils/cn";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { FaqItem } from "@/shared/lib/schemas/components/faq-accordion.schema";

type FaqAccordionContent = NonNullable<Dictionary["faqAccordion"]>;

interface FaqAccordionProps {
  content: FaqAccordionContent;
  isFocused?: boolean;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const FaqAccordion = forwardRef<HTMLElement, FaqAccordionProps>(
  ({ content, isFocused }, ref) => {
    logger.info("[FaqAccordion] Renderizando v7.0 (Elite & Compositional).");

    if (!content) {
      logger.warn(
        "[FaqAccordion] No se proporcionó contenido. No se renderizará."
      );
      return null;
    }

    const { title, faqs } = content;

    return (
      <motion.section
        ref={ref}
        variants={sectionVariants}
        id="faq"
        className={cn(
          "py-24 sm:py-32 bg-muted/40 transition-all duration-300 rounded-lg",
          isFocused &&
            "ring-2 ring-primary ring-offset-4 ring-offset-background"
        )}
        aria-labelledby="faq-title"
      >
        <Container className="max-w-3xl">
          <h2
            id="faq-title"
            className="text-3xl font-bold text-center text-foreground mb-12 sm:text-4xl"
          >
            {title}
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faqItem: FaqItem, index: number) => (
              // Se utiliza el patrón de composición, resolviendo el error de tipo.
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faqItem.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{faqItem.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </motion.section>
    );
  }
);
FaqAccordion.displayName = "FaqAccordion";
