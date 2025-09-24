// components/sections/SponsorsSection.tsx
/**
 * @file SponsorsSection.tsx
 * @description Componente de sección para mostrar una cuadrícula de logos de patrocinadores.
 *              - v1.2.0: Consistencia confirmada.
 *              - v1.3.0 (Resilience): La prop `content` ahora es opcional.
 * @version 1.3.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { Container } from "@/components/ui/Container";
import { DynamicIcon } from "@/components/ui";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { SponsorItem } from "@/shared/lib/schemas/components/sponsors-section.schema";

interface SponsorsSectionProps {
  // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
  content?: Dictionary["sponsorsSection"];
  // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---
}

export function SponsorsSection({
  content,
}: SponsorsSectionProps): React.ReactElement | null {
  logger.info("[Observabilidad] Renderizando SponsorsSection");

  // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
  if (!content) {
    logger.warn(
      "[SponsorsSection] No se proporcionó contenido. La sección no se renderizará."
    );
    return null;
  }
  // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---

  const { title, sponsors } = content;

  return (
    <section id="sponsors" className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-lg font-semibold leading-8 text-foreground">
            {title}
          </h2>
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-7">
            {sponsors.map((sponsor: SponsorItem) => (
              <div
                key={sponsor.name}
                className="col-span-2 flex justify-center lg:col-span-1"
              >
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <DynamicIcon name={sponsor.icon} size={24} />
                  <span className="font-semibold">{sponsor.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
// components/sections/SponsorsSection.tsx
