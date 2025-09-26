// RUTA: src/app/[locale]/(dev)/nos3/[sessionId]/page.tsx
/**
 * @file page.tsx
 * @description Página de servidor para el reproductor de sesiones de `nos3`.
 * @version 2.0.0 (Sovereign Path Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { logger } from "@/shared/lib/logging";
import { getSessionEventsAction } from "@/shared/lib/actions/nos3";
import { SessionPlayerClient } from "./_components";

interface Nos3PlayerPageProps {
  params: { sessionId: string };
}

export default async function Nos3PlayerPage({ params }: Nos3PlayerPageProps) {
  const { sessionId } = params;
  logger.info(
    `[Nos3PlayerPage] Renderizando página para la sesión: ${sessionId}`
  );

  const eventsResult = await getSessionEventsAction(sessionId);

  if (!eventsResult.success) {
    return (
      <DeveloperErrorDisplay
        context="Nos3PlayerPage"
        errorMessage={`No se pudieron cargar los eventos para la sesión ${sessionId}.`}
        errorDetails={eventsResult.error}
      />
    );
  }

  return (
    <>
      <PageHeader
        content={{
          title: `Reproduciendo Sesión`,
          subtitle: `ID: ${sessionId}`,
        }}
      />
      <Container className="py-8">
        <SessionPlayerClient events={eventsResult.data} />
      </Container>
    </>
  );
}
