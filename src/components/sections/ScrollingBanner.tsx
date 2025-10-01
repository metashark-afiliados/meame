// RUTA: src/components/sections/ScrollingBanner.tsx
/**
 * @file ScrollingBanner.tsx
 * @description Componente de sección para una marquesina de anuncios desplazable.
 *              v2.0.0 (Elite Modernization & MEA/UX): Refactorizado para ser
 *              una entidad soberana, con estilo profesional, animación deliberada
 *              y cumplimiento total de los 8 Pilares de Calidad.
 * @version 2.0.0
 *@author RaZ Podestá - MetaShark Tech
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
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const ScrollingBanner = forwardRef<HTMLElement, ScrollingBannerProps>(
  ({ content, isFocused }, ref) => {
    logger.info("[ScrollingBanner] Renderizando v2.0 (Elite Modernization).");

    if (!content) {
      logger.warn(
        "[ScrollingBanner] No se proporcionó contenido. No se renderizará."
      );
      return null;
    }

    return (
      <motion.section
        ref={ref}
        variants={sectionVariants}
        className={cn(
          "py-3 bg-muted/30 text-muted-foreground border-b",
          isFocused &&
            "ring-2 ring-primary ring-offset-4 ring-offset-background"
        )}
        role="status"
      >
        <Container>
          <Marquee speed={40} autoFill={true} pauseOnHover={true}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div className="flex items-center mx-12" key={index}>
                {content.iconName && (
                  <DynamicIcon
                    name={content.iconName}
                    className="h-4 w-4 mr-3 flex-shrink-0 text-primary"
                    aria-hidden="true"
                  />
                )}
                <span
                  className="text-sm font-semibold tracking-wider"
                  dangerouslySetInnerHTML={{ __html: content.message }}
                />
              </div>
            ))}
          </Marquee>
        </Container>
      </motion.section>
    );
  }
);

ScrollingBanner.displayName = "ScrollingBanner";
