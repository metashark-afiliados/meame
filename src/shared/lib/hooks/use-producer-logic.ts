// Ruta correcta: src/shared/lib/hooks/use-producer-logic.ts
/**
 * @file use-producer-logic.ts
 * @description Hook Soberano Orquestador para toda la lógica del productor.
 *              v6.0.0 (Sovereign Path Restoration): Se corrigen todas las rutas
 *              de importación para alinearse con la SSoT de la arquitectura de
 *              archivos, resolviendo errores críticos de build.
 * @version 6.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useState, useEffect } from "react";
import { logger } from "@/shared/lib/logging";
import { producerConfig } from "@/shared/lib/config/producer.config";
import { useCookieConsent } from "@/shared/lib/hooks/use-cookie-consent";
import { useUtmTracker } from "@/shared/hooks/use-utm-tracker";
import { useYandexMetrika } from "@/shared/hooks/use-yandex-metrika";
import { useGoogleAnalytics } from "@/shared/hooks/use-google-analytics";
import { useTrufflePixel } from "@/shared/hooks/use-truffle-pixel";
import { useWebvorkGuid } from "@/shared/hooks/use-webvork-guid";
import { useNos3Tracker } from "@/shared/hooks/use-nos3-tracker";

const ORCHESTRATOR_STYLE =
  "color: #8b5cf6; font-weight: bold; border: 1px solid #8b5cf6; padding: 2px 4px; border-radius: 4px;";

export function useProducerLogic(): void {
  const { status: consentStatus } = useCookieConsent();
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (hasInteracted) return;

    const handleInteraction = () => {
      logger.info(
        "[useProducerLogic] Interacción de usuario detectada. Activando lógica de tracking diferido."
      );
      setHasInteracted(true);
      removeListeners();
    };

    const eventListeners: (keyof WindowEventMap)[] = [
      "mousedown",
      "touchstart",
      "keydown",
      "scroll",
    ];
    const addListeners = () =>
      eventListeners.forEach((event) =>
        window.addEventListener(event, handleInteraction, {
          once: true,
          passive: true,
        })
      );
    const removeListeners = () =>
      eventListeners.forEach((event) =>
        window.removeEventListener(event, handleInteraction)
      );

    addListeners();
    return () => removeListeners();
  }, [hasInteracted]);

  const canInitializeTracking =
    producerConfig.TRACKING_ENABLED && consentStatus === "accepted";
  const shouldInitialize = canInitializeTracking && hasInteracted;

  useEffect(() => {
    if (!producerConfig.TRACKING_ENABLED) {
      logger.warn(
        "[useProducerLogic] Tracking deshabilitado por configuración global."
      );
      return;
    }
    if (consentStatus === "rejected") {
      logger.info(
        "[useProducerLogic] Tracking deshabilitado por preferencia del usuario."
      );
    } else if (consentStatus === "accepted" && !hasInteracted) {
      console.log(
        `%c[useProducerLogic] Tracking en espera de interacción del usuario...`,
        ORCHESTRATOR_STYLE
      );
    }
  }, [consentStatus, hasInteracted]);

  // Invocación de los hooks de tracking atómicos
  useUtmTracker(shouldInitialize);
  useYandexMetrika(shouldInitialize);
  useGoogleAnalytics(shouldInitialize);
  useTrufflePixel(shouldInitialize);
  useWebvorkGuid(shouldInitialize);
  useNos3Tracker(shouldInitialize);
}
