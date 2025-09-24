// RUTA: app/[locale]/(dev)/nos3/[sessionId]/_components/SessionPlayerClient.tsx
/**
 * @file SessionPlayerClient.tsx
 * @description Componente de cliente que envuelve e instancia el `rrweb-player`.
 *              v1.2.0 (React Hooks Compliance): Resuelve la advertencia de
 *              exhaustive-deps para una limpieza de efectos robusta y sin
 *              condiciones de carrera.
 * @version 1.2.0
 * @author RaZ Podestá - MetaShark Tech
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
    // --- [INICIO DE CORRECCIÓN: REACT HOOKS COMPLIANCE] ---
    // Se captura el valor actual del ref en una constante local.
    const containerElement = playerContainerRef.current;
    // --- [FIN DE CORRECCIÓN: REACT HOOKS COMPLIANCE] ---

    if (containerElement && !playerInstanceRef.current) {
      logger.info(
        "[SessionPlayerClient] Montando instancia de rrweb-player..."
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
      } catch (error) {
        logger.error("Fallo al instanciar rrwebPlayer.", { error });
      }
    }

    return () => {
      // --- [INICIO DE CORRECCIÓN: REACT HOOKS COMPLIANCE] ---
      // La función de limpieza ahora utiliza la constante local, que es estable.
      if (playerInstanceRef.current && containerElement) {
        logger.info(
          "[SessionPlayerClient] Desmontando instancia de rrweb-player."
        );
        while (containerElement.firstChild) {
          containerElement.removeChild(containerElement.firstChild);
        }
        playerInstanceRef.current = null;
      }
      // --- [FIN DE CORRECCIÓN: REACT HOOKS COMPLIANCE] ---
    };
  }, [events]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div ref={playerContainerRef} className="rr-player-container"></div>
      </CardContent>
    </Card>
  );
}
