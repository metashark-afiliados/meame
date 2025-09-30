// RUTA: src/app/[locale]/(dev)/nos3/[sessionId]/_components/SessionPlayerClient.tsx
/**
 * @file SessionPlayerClient.tsx
 * @description Componente de cliente que envuelve e instancia el `rrweb-player`.
 *              v1.3.0 (Elite Observability Injection): Inyectado con logging
 *              para confirmar la recepción de props y el ciclo de vida del reproductor.
 * @version 1.3.0
 * @author L.I.A. Legacy
 */
"use client";

import React, { useEffect, useRef } from "react";
import rrwebPlayer from "rrweb-player";
import "rrweb-player/dist/style.css";
import type { eventWithTime } from "@/shared/lib/types/rrweb.types";
import { Card, CardContent } from "@/components/ui";
import { logger } from "@/shared/lib/logging";

interface SessionPlayerClientProps {
  events: eventWithTime[];
}

export function SessionPlayerClient({
  events,
}: SessionPlayerClientProps): React.ReactElement {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<rrwebPlayer | null>(null);

  useEffect(() => {
    const containerElement = playerContainerRef.current;
    if (containerElement && !playerInstanceRef.current) {
      logger.info(
        `[SessionPlayerClient] Montando instancia de rrweb-player con ${events.length} eventos...`
      );
      try {
        playerInstanceRef.current = new rrwebPlayer({
          target: containerElement,
          props: {
            events,
            autoPlay: true,
            showController: true,
            width: 1280,
            height: 720,
          },
        });
        logger.success(
          "[SessionPlayerClient] Reproductor rrweb instanciado con éxito."
        );
      } catch (error) {
        logger.error(
          "[SessionPlayerClient] Fallo crítico al instanciar rrwebPlayer.",
          { error }
        );
      }
    }

    return () => {
      if (playerInstanceRef.current && containerElement) {
        logger.info(
          "[SessionPlayerClient] Desmontando instancia de rrweb-player."
        );
        // Limpieza robusta para evitar nodos DOM huérfanos
        while (containerElement.firstChild) {
          containerElement.removeChild(containerElement.firstChild);
        }
        playerInstanceRef.current = null;
      }
    };
  }, [events]); // El array de dependencias es correcto y eficiente.

  return (
    <Card>
      <CardContent className="pt-6">
        <div ref={playerContainerRef} className="rr-player-container"></div>
      </CardContent>
    </Card>
  );
}
