// RUTA: src/components/sections/CommunitySection.tsx
/**
 * @file CommunitySection.tsx
 * @description Componente de sección para invitar a la comunidad.
 * @version 4.0.0 (Polymorphic Button Fix & Elite Compliance)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";
import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

interface CommunitySectionProps {
  content?: Dictionary["communitySection"];
}

export function CommunitySection({
  content,
}: CommunitySectionProps): React.ReactElement | null {
  logger.info("[CommunitySection] Renderizando v4.0 (Polymorphic Button Fix).");

  if (!content) {
    logger.warn(
      "[CommunitySection] No se proporcionó contenido. No se renderizará."
    );
    return null;
  }

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
            {/* --- [INICIO DE REFACTORIZACIÓN POLIMÓRFICA] --- */}
            <Button asChild size="lg" variant="default">
              <Link href={buttonHref}>{buttonLabel}</Link>
            </Button>
            {/* --- [FIN DE REFACTORIZACIÓN POLIMÓRFICA] --- */}
          </div>
        </div>
      </Container>
    </section>
  );
}
