// components/sections/FeaturesSection.tsx
/**
 * @file FeaturesSection.tsx
 * @description Componente de sección para mostrar una lista de características clave.
 *              - v2.0.0 (Type Safety): Aplica tipos explícitos.
 *              - v2.1.0 (Resilience): La prop `content` ahora es opcional.
 * @version 2.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { Container } from "@/components/ui/Container";
import { DynamicIcon } from "@/components/ui";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { FeatureItem } from "@/shared/lib/schemas/components/features-section.schema";

interface FeaturesSectionProps {
  // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
  content?: Dictionary["featuresSection"];
  // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---
}

export function FeaturesSection({
  content,
}: FeaturesSectionProps): React.ReactElement | null {
  logger.info("[Observabilidad] Renderizando FeaturesSection");

  // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
  if (!content) {
    logger.warn(
      "[FeaturesSection] No se proporcionó contenido. La sección no se renderizará."
    );
    return null;
  }
  // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---

  const { eyebrow, title, subtitle, features } = content;

  return (
    <section id="features" className="py-24 sm:py-32 bg-background/50">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            {eyebrow}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature: FeatureItem) => (
              <div key={feature.title} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-foreground">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <DynamicIcon
                      name={feature.icon}
                      className="h-6 w-6 text-primary-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  {feature.title}
                </dt>
                <dd className="mt-2 text-base leading-7 text-muted-foreground">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
// components/sections/FeaturesSection.tsx
