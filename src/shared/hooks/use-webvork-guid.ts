// Ruta correcta: src/shared/hooks/use-webvork-guid.ts
/**
 * @file use-webvork-guid.ts
 * @description Hook Atómico de Efecto para obtener el GUID de Webvork.
 * @version 3.2.0 (Sovereign Path Normalization)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useEffect, useRef } from "react";
import { producerConfig } from "@/shared/lib/config/producer.config";
import { logger } from "@/shared/lib/logging";

type JsonpCallback = () => void;

declare global {
  interface Window {
    [key: string]: JsonpCallback | unknown;
  }
}

const setCookie = (name: string, value: string, days: number = 30): void => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ""}${expires}; path=/`;
};

export function useWebvorkGuid(enabled: boolean): void {
  const hasExecuted = useRef(false);

  useEffect(() => {
    if (!enabled || hasExecuted.current) {
      return;
    }

    logger.startGroup("Hook: useWebvorkGuid");

    const { LANDING_ID, OFFER_ID } = producerConfig;

    if (!LANDING_ID || !OFFER_ID) {
      logger.warn(
        "LANDING_ID o OFFER_ID no configurados. Abortando llamada de GUID."
      );
      logger.endGroup();
      return;
    }

    logger.trace("Activado. Iniciando solicitud de GUID a Webvork...");

    const callbackName = "jsonp_callback_" + Math.round(100000 * Math.random());
    const scriptTagId = `script_${callbackName}`;

    window[callbackName] = () => {
      logger.startGroup("Callback: Webvork GUID Recibido");
      try {
        const guidFromHtml = document.documentElement.getAttribute("data-guid");
        if (guidFromHtml) {
          logger.info(
            `GUID confirmado desde atributo data-guid: ${guidFromHtml}`
          );
          setCookie("wv_guid", guidFromHtml, 30);
        } else {
          logger.warn(
            "Callback recibido, pero el atributo data-guid no fue encontrado."
          );
        }
      } catch (error) {
        logger.error("Error procesando callback de GUID.", { error });
      } finally {
        delete window[callbackName];
        const scriptElement = document.getElementById(scriptTagId);
        scriptElement?.remove();
        logger.endGroup();
      }
    };

    const trackerUrl = `//webvkrd.com/js.php?landing_id=${LANDING_ID}&offer_id=${OFFER_ID}&page_type=landing&callback=${callbackName}`;
    const scriptTag = document.createElement("script");
    scriptTag.id = scriptTagId;
    scriptTag.src = trackerUrl;
    document.body.appendChild(scriptTag);

    hasExecuted.current = true;
    logger.endGroup();
  }, [enabled]);
}
// Ruta correcta: src/shared/hooks/use-webvork-guid.ts
