// RUTA: src/shared/hooks/use-nos3-tracker.ts
/**
 * @file use-nos3-tracker.ts
 * @description Hook soberano y orquestador para el colector de `nos3`.
 * @version 4.0.0 (Build Integrity Restored - Definitive Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
// --- [INICIO DE SOLUCIÓN DEFINITIVA] ---
// Se utiliza una importación de espacio de nombres, que es la forma
// canónica y segura de importar módulos que no tienen una exportación por defecto clara.
import * as rrweb from "rrweb";
// --- [FIN DE SOLUCIÓN DEFINITIVA] ---
import { createId } from "@paralleldrive/cuid2";
import { logger } from "@/shared/lib/logging";
import type { eventWithTime } from "@/shared/lib/types/rrweb.types.ts";

const SESSION_STORAGE_KEY = "nos3_session_id";
const BATCH_INTERVAL_MS = 15000;
const MAX_EVENTS_PER_BATCH = 100;

export function useNos3Tracker(enabled: boolean): void {
  const isRecording = useRef(false);
  const eventsBuffer = useRef<eventWithTime[]>([]);
  const pathname = usePathname();

  const getOrCreateSessionId = useCallback((): string => {
    try {
      let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!sessionId) {
        sessionId = createId();
        sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
        logger.trace(`[nos3-colector] Nueva sesión iniciada: ${sessionId}`);
      }
      return sessionId;
    } catch (error) {
      logger.warn(
        "[nos3-colector] sessionStorage no está disponible. Usando ID efímero.",
        { error }
      );
      return createId();
    }
  }, []);

  const flushEvents = useCallback(
    async (isUnloading = false) => {
      if (eventsBuffer.current.length === 0) return;

      const eventsToSend = [...eventsBuffer.current];
      eventsBuffer.current = [];

      const sessionId = getOrCreateSessionId();
      const payload = {
        sessionId,
        events: eventsToSend,
        metadata: {
          pathname,
          timestamp: Date.now(),
        },
      };

      try {
        const body = JSON.stringify(payload);
        if (isUnloading && navigator.sendBeacon) {
          navigator.sendBeacon("/api/nos3/ingest", body);
        } else {
          await fetch("/api/nos3/ingest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            keepalive: true,
          });
        }
      } catch (error) {
        logger.error("[nos3-colector] Fallo al enviar lote de eventos.", {
          error,
        });
        eventsBuffer.current = [...eventsToSend, ...eventsBuffer.current];
      }
    },
    [pathname, getOrCreateSessionId]
  );

  useEffect(() => {
    if (!enabled || isRecording.current) {
      return;
    }
    logger.info(
      "[nos3-colector] Condiciones cumplidas. Iniciando grabación de sesión."
    );
    isRecording.current = true;

    const intervalId = setInterval(flushEvents, BATCH_INTERVAL_MS);

    // Se utiliza la función 'record' desde el objeto de espacio de nombres 'rrweb'.
    // Se añade el tipo explícito al parámetro 'event' para resolver TS7006.
    const stopRecording = rrweb.record({
      emit(event: eventWithTime) {
        eventsBuffer.current.push(event);
        if (eventsBuffer.current.length >= MAX_EVENTS_PER_BATCH) {
          flushEvents();
        }
      },
      maskAllInputs: true,
      blockClass: "nos3-block",
      maskTextClass: "nos3-mask",
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushEvents(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      logger.info("[nos3-colector] Deteniendo grabación de sesión.");
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (stopRecording) {
        stopRecording();
      }
      flushEvents(true);
      isRecording.current = false;
    };
  }, [enabled, flushEvents]);
}
