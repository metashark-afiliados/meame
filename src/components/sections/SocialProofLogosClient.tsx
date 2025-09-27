// RUTA: src/components/sections/SocialProofLogosClient.tsx
/**
 * @file SocialProofLogosClient.tsx
 * @description Componente de cliente puro y de élite para la sección de prueba social.
 *              Es 100% data-driven y se encarga exclusivamente del renderizado.
 *              Cumple con los 7 Pilares de Calidad.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import Marquee from "react-fast-marquee";
import { CldImage } from "next-cloudinary";
import { Container } from "@/components/ui/Container";
import { logger } from "@/shared/lib/logging";

// --- Pilar I (i18n) y Pilar IV (TSDoc): Contrato de Datos Explícito ---
interface LogoData {
  alt: string;
  publicId: string;
  width: number;
  height: number;
}

interface SocialProofLogosClientProps {
  title: string;
  logos: LogoData[];
}

export function SocialProofLogosClient({
  title,
  logos,
}: SocialProofLogosClientProps) {
  // --- Pilar III (Observabilidad) ---
  logger.info(
    "[SocialProofLogosClient] Renderizando componente de cliente puro."
  );

  return (
    // --- Pilar II (Theming) y Pilar VI (Resiliencia) ---
    <section
      aria-labelledby="social-proof-title"
      className="py-12 bg-background"
    >
      <Container>
        <h2
          id="social-proof-title"
          className="text-center font-semibold text-foreground/70 uppercase tracking-wider mb-8"
        >
          {title}
        </h2>
        <Marquee
          gradient
          gradientColor="hsl(var(--background))"
          gradientWidth={100}
          speed={40}
          autoFill
          pauseOnHover
        >
          {logos.map((logo) => (
            <div
              key={logo.publicId}
              className="mx-12 flex items-center justify-center h-10"
            >
              <CldImage
                src={logo.publicId}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                format="auto"
                quality="auto"
                className="h-10 w-auto object-contain grayscale opacity-60 transition-all duration-300 ease-in-out hover:grayscale-0 hover:opacity-100 hover:scale-110"
              />
            </div>
          ))}
        </Marquee>
      </Container>
    </section>
  );
}
