// RUTA: src/components/sections/ScrollingBanner.tsx
/**
 * @file ScrollingBanner.tsx
 * @description Componente de sección para una marquesina de anuncios desplazable.
 *              Construido para cumplir con los 7 Pilares de Calidad.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { forwardRef } from "react";
import Marquee from "react-fast-marquee";
import { motion, type Variants } from "framer-motion";
import { DynamicIcon, Container } from "@/components/ui";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { cn } from "@/shared/lib/utils/cn";

type ScrollingBannerContent = NonNullable<Dictionary["scrollingBanner"]>;

interface ScrollingBannerProps {
  content?: ScrollingBannerContent;
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

export const ScrollingBanner = forwardRef<HTMLElement, ScrollingBannerProps>(
  ({ content, isFocused }, ref) => {
    logger.info("[ScrollingBanner] Renderizando v1.0.");

    if (!content) {
      logger.warn("[ScrollingBanner] No se proporcionó contenido.");
      return null;
    }

    return (
      <motion.section
        ref={ref}
        variants={sectionVariants}
        className={cn(
          "py-3 bg-primary text-primary-foreground",
          isFocused && "ring-2 ring-primary ring-offset-4 ring-offset-background"
        )}
        role="alert"
      >
        <Container>
          <Marquee speed={50} autoFill={true} pauseOnHover={true}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div className="flex items-center mx-12" key={index}>
                <DynamicIcon
                  name="TriangleAlert"
                  className="h-4 w-4 mr-3 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  {content.message}
                </span>
              </div>
            ))}
          </Marquee>
        </Container>
      </motion.section>
    );
  }
);

ScrollingBanner.displayName = "ScrollingBanner";
