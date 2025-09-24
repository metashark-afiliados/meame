// RUTA: app/[locale]/(dev)/nos3/[sessionId]/page.tsx
/**
 * @file page.tsx
 * @description Página de servidor para el reproductor de sesiones de `nos3`.
 *              v1.1.0 (Module Resolution Fix): Se alinea con la Directiva 021
 *              utilizando un archivo de barril para una resolución de módulos robusta.
 * @version 1.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui";
import { DeveloperErrorDisplay } from "@/components/dev";
import { logger } from "@/shared/lib/logging";
import { getSessionEventsAction } from "../_actions";
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
