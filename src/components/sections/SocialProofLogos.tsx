// RUTA: components/sections/SocialProofLogos.tsx

/**
 * @file SocialProofLogos.tsx
 * @description Componente de prueba social con logos en marquesina.
 *              v6.0.0 (Holistic Elite Leveling & MEA): Refactorizado para cumplir
 *              con los 5 pilares de calidad. Se elimina el theming hardcodeado
 *              y se implementan micro-interacciones MEA/UX (grayscale, opacity,
 *              scale on hover) para una experiencia de usuario superior.
 * @version 6.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { logger } from "@/shared/lib/logging";
import type { Logo } from "@/shared/lib/schemas/components/social-proof-logos.schema";

interface SocialProofLogosProps {
  content?: Dictionary["socialProofLogos"];
}

export function SocialProofLogos({
  content,
}: SocialProofLogosProps): React.ReactElement | null {
  logger.info("[SocialProofLogos] Renderizando v6.0 (Elite & MEA).");

  if (!content || !content.logos || content.logos.length === 0) {
    logger.warn(
      "[SocialProofLogos] No se proporcionó contenido válido. La sección no se renderizará."
    );
    return null;
  }

  const { title, logos } = content;

  return (
    <section
      className="py-12 bg-background"
      aria-labelledby="social-proof-title"
    >
      <Container>
        <h2
          id="social-proof-title"
          className="text-center font-semibold text-foreground/70 uppercase tracking-wider mb-8"
        >
          {title}
        </h2>
        <Marquee
          gradient={true}
          gradientColor="hsl(var(--background))" // <-- Theming ahora usa tokens
          gradientWidth={100}
          speed={40}
          autoFill={true}
          pauseOnHover={true}
        >
          {logos.map((logo: Logo) => (
            <div
              key={logo.alt}
              className="mx-12 flex items-center justify-center"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={140}
                height={40}
                className="h-10 w-auto object-contain grayscale opacity-60 transition-all duration-300 ease-in-out hover:grayscale-0 hover:opacity-100 hover:scale-110" // <-- MEA/UX
              />
            </div>
          ))}
        </Marquee>
      </Container>
    </section>
  );
}
