// RUTA: src/app/[locale]/(dev)/nos3/[sessionId]/page.tsx
/**
 * @file page.tsx
 * @description Página de servidor para el reproductor de sesiones de `nos3`.
 *              v2.1.0 (Elite Observability Injection): Inyectado con logging
 *              estructurado para una trazabilidad completa del flujo de datos.
 * @version 2.1.0
 * @author L.I.A. Legacy
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
  const traceId = logger.startTrace(`Nos3PlayerPage:${sessionId}`);
  logger.info(
    `[Nos3PlayerPage] Iniciando renderizado para la sesión: ${sessionId}`,
    { traceId }
  );

  const eventsResult = await getSessionEventsAction(sessionId);

  if (!eventsResult.success) {
    logger.error(
      `[Nos3PlayerPage] Fallo al obtener eventos. Renderizando error.`,
      { error: eventsResult.error, traceId }
    );
    logger.endTrace(traceId);
    return (
      <DeveloperErrorDisplay
        context="Nos3PlayerPage"
        errorMessage={`No se pudieron cargar los eventos para la sesión ${sessionId}.`}
        errorDetails={eventsResult.error}
      />
    );
  }

  logger.success(
    `[Nos3PlayerPage] Eventos obtenidos con éxito. Delegando ${eventsResult.data.length} eventos al cliente.`,
    { traceId }
  );
  logger.endTrace(traceId);

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
