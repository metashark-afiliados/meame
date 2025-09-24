// components/sections/GuaranteeSection.tsx
/**
 * @file GuaranteeSection.tsx
 * @description Muestra una marquesina con los sellos de calidad y confianza.
 *              - v5.0.0: Adherido al contrato de props unificado.
 *              - v5.1.0 (Resilience): La prop `content` ahora es opcional.
 * @version 5.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import { Container } from "@/components/ui/Container";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { Seal } from "@/shared/lib/schemas/components/guarantee-section.schema";

interface GuaranteeSectionProps {
  // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
  content?: Dictionary["guaranteeSection"];
  // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---
}

export function GuaranteeSection({
  content,
}: GuaranteeSectionProps): React.ReactElement | null {
  logger.info("[Observabilidad] Renderizando GuaranteeSection");

  // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
  if (!content) {
    logger.warn(
      "[GuaranteeSection] No se proporcionó contenido. La sección no se renderizará."
    );
    return null;
  }
  // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---

  const { title, seals } = content;

  return (
    <section className="py-16 sm:py-24 bg-background">
      <Container>
        <h2 className="text-3xl font-bold text-center text-foreground mb-12 sm:text-4xl">
          {title}
        </h2>
        <Marquee
          gradient={true}
          gradientColor="hsl(var(--background))"
          gradientWidth={100}
          speed={50}
          autoFill={true}
          pauseOnHover={true}
        >
          {seals.map((seal: Seal) => (
            <div
              key={seal.imageAlt}
              className="mx-12 flex items-center justify-center"
            >
              <Image
                src={seal.imageUrl}
                alt={seal.imageAlt}
                width={120}
                height={120}
                className="h-24 w-24 md:h-32 md:w-32 object-contain"
              />
            </div>
          ))}
        </Marquee>
      </Container>
    </section>
  );
}
// components/sections/GuaranteeSection.tsx
