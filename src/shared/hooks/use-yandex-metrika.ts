// Ruta correcta: src/shared/hooks/use-yandex-metrika.ts
/**
 * @file useYandexMetrika.ts
 * @description Hook Atómico de Efecto para el píxel de Yandex Metrika.
 * @version 3.1.0 (Sovereign Path Normalization)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useEffect, useRef } from "react";
import { producerConfig } from "@/shared/lib/config/producer.config";
import { logger } from "@/shared/lib/logging";

const YANDEX_SCRIPT_ID = "yandex-metrika-init";

export function useYandexMetrika(enabled: boolean): void {
  const hasExecuted = useRef(false);

  useEffect(() => {
    if (!enabled || hasExecuted.current) {
      return;
    }

    const yandexId = producerConfig.TRACKING.YANDEX_METRIKA_ID;

    if (!yandexId) {
      return;
    }

    if (document.getElementById(YANDEX_SCRIPT_ID)) {
      return;
    }

    logger.startGroup("Hook: useYandexMetrika");
    logger.trace(
      `Activado. Inyectando script de Yandex Metrika con ID: ${yandexId}`
    );

    const ymScriptContent = `
      (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)}; m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
      (window, document, "script", "https://mc.yandex.com/metrika/tag.js", "ym");
      ym(${yandexId}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });
    `;

    const script = document.createElement("script");
    script.id = YANDEX_SCRIPT_ID;
    script.innerHTML = ymScriptContent;
    document.head.appendChild(script);

    logger.info("Pixel de Yandex Metrika inyectado y activado.", {
      id: yandexId,
    });

    hasExecuted.current = true;
    logger.endGroup();
  }, [enabled]);
}
// Ruta correcta: src/shared/hooks/use-yandex-metrika.ts
