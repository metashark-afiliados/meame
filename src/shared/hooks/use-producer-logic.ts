// RUTA: src/shared/hooks/use-producer-logic.ts
/**
 * @file use-producer-logic.ts
 * @description Hook Soberano Orquestador para toda la lógica de tracking del productor.
 * @version 6.1.0 (Architectural Integrity Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useState, useEffect } from "react";
import { logger } from "@/shared/lib/logging";
import { getProducerConfig } from "@/shared/lib/config/producer.config";
import { useCookieConsent } from "@/shared/lib/hooks/use-cookie-consent";
import { useUtmTracker } from "@/shared/hooks/use-utm-tracker";
import { useYandexMetrika } from "@/shared/hooks/use-yandex-metrika";
import { useGoogleAnalytics } from "@/shared/hooks/use-google-analytics";
import { useTrufflePixel } from "@/shared/hooks/use-truffle-pixel";
import { useWebvorkGuid } from "@/shared/hooks/use-webvork-guid";
import { useNos3Tracker } from "@/shared/hooks/use-nos3-tracker";

export function useProducerLogic(): void {
  const producerConfig = getProducerConfig();
  const { status: consentStatus } = useCookieConsent();
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (hasInteracted) return;

    const handleInteraction = () => {
      logger.info(
        "[ProducerLogic] Interacción de usuario detectada. El tracking ahora es elegible para activación."
      );
      setHasInteracted(true);
      eventListeners.forEach((event) =>
        window.removeEventListener(event, handleInteraction)
      );
    };

    const eventListeners: (keyof WindowEventMap)[] = [
      "mousedown",
      "touchstart",
      "keydown",
      "scroll",
    ];

    eventListeners.forEach((event) =>
      window.addEventListener(event, handleInteraction, {
        once: true,
        passive: true,
      })
    );

    return () =>
      eventListeners.forEach((event) =>
        window.removeEventListener(event, handleInteraction)
      );
  }, [hasInteracted]);

  const canInitializeTracking =
    producerConfig.TRACKING_ENABLED && consentStatus === "accepted";
  const shouldInitialize = canInitializeTracking && hasInteracted;

  useEffect(() => {
    logger.startGroup("[ProducerLogic Orchestrator]");
    if (!producerConfig.TRACKING_ENABLED) {
      logger.warn(
        "Estado: Inactivo. Razón: Deshabilitado globalmente en `.env.local`."
      );
    } else if (consentStatus === "rejected") {
      logger.info(
        "Estado: Inactivo. Razón: El usuario ha rechazado las cookies."
      );
    } else if (consentStatus === "pending") {
      logger.info(
        "Estado: Pendiente. Razón: Esperando consentimiento del usuario."
      );
    } else if (!hasInteracted) {
      logger.info(
        "Estado: Pendiente. Razón: Consentimiento aceptado, esperando interacción del usuario."
      );
    } else {
      logger.success(
        "Estado: Activo. Todas las condiciones cumplidas. Inicializando hooks de tracking..."
      );
    }
    logger.endGroup();
  }, [consentStatus, hasInteracted, producerConfig.TRACKING_ENABLED]);

  useUtmTracker(shouldInitialize);
  useYandexMetrika(shouldInitialize);
  useGoogleAnalytics(shouldInitialize);
  useTrufflePixel(shouldInitialize);
  useWebvorkGuid(shouldInitialize);
  useNos3Tracker(shouldInitialize);
}
