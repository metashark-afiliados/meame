// components/sections/ServicesSection.tsx
/**
 * @file ServicesSection.tsx
 * @description Componente de sección para mostrar una lista de servicios.
 *              - v1.1.0 (Resilience): La prop `content` ahora es opcional.
 * @version 1.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { Container } from "@/components/ui/Container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { ServiceItem } from "@/shared/lib/schemas/components/services-section.schema";

interface ServicesSectionProps {
  // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
  content?: Dictionary["servicesSection"];
  // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---
}

export function ServicesSection({
  content,
}: ServicesSectionProps): React.ReactElement | null {
  logger.info("[Observabilidad] Renderizando ServicesSection");

  // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
  if (!content) {
    logger.warn(
      "[ServicesSection] No se proporcionó contenido. La sección no se renderizará."
    );
    return null;
  }
  // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---

  const { eyebrow, title, subtitle, proLabel, services } = content;

  return (
    <section id="services" className="py-24 sm:py-32">
      <Container className="max-w-4xl">
        <div className="text-center">
          <h2 className="text-lg text-primary mb-2 tracking-wider">
            {eyebrow}
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold mb-4">{title}</h3>
          <p className="text-xl text-muted-foreground">{subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-12">
          {services.map((service: ServiceItem) => (
            <Card key={service.title}>
              <CardHeader className="flex justify-between flex-row items-start pb-4">
                <div>
                  <CardTitle>{service.title}</CardTitle>
                </div>
                {service.isPro && (
                  <Badge variant="secondary" className="text-sm">
                    {proLabel}
                  </Badge>
                )}
              </CardHeader>

              <CardContent>
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
// components/sections/ServicesSection.tsx
