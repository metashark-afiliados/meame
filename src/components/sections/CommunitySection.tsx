// components/sections/CommunitySection.tsx
/**
 * @file CommunitySection.tsx
 * @description Componente de sección para invitar a la comunidad.
 *              - v3.1.0 (Build Stability): Se estandarizan las rutas de importación.
 *              - v3.2.0 (Resilience): La prop `content` ahora es opcional.
 * @version 3.2.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

interface CommunitySectionProps {
  // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
  content?: Dictionary["communitySection"];
  // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---
}

export function CommunitySection({
  content,
}: CommunitySectionProps): React.ReactElement | null {
  logger.info("[Observabilidad] Renderizando CommunitySection");

  // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
  if (!content) {
    logger.warn(
      "[CommunitySection] No se proporcionó contenido. La sección no se renderizará."
    );
    return null;
  }
  // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---

  const { iconName, title, description, buttonLabel, buttonHref } = content;

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <DynamicIcon
            name={iconName}
            size={48}
            className="mx-auto mb-6 text-primary"
          />
          <h2
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            {description}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button href={buttonHref} size="lg" variant="default">
              {buttonLabel}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
// components/sections/CommunitySection.tsx
