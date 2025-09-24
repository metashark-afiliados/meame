// Ruta correcta: src/shared/hooks/use-truffle-pixel.ts
/**
 * @file useTrufflePixel.ts
 * @description Hook Atómico de Efecto para el píxel de Truffle.bid.
 * @version 3.1.0 (Sovereign Path Normalization)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useEffect, useRef } from "react";
import { producerConfig } from "@/shared/lib/config/producer.config";
import { logger } from "@/shared/lib/logging";

const TRUFFLE_SCRIPT_ID = "truffle-pixel-init";

export function useTrufflePixel(enabled: boolean): void {
  const hasExecuted = useRef(false);

  useEffect(() => {
    if (!enabled || hasExecuted.current) {
      return;
    }
    const truffleId = producerConfig.TRACKING.TRUFFLE_PIXEL_ID;
    if (!truffleId) {
      return;
    }
    if (document.getElementById(TRUFFLE_SCRIPT_ID)) {
      return;
    }
    logger.startGroup("Hook: useTrufflePixel");
    logger.trace(
      `Activado. Inyectando script de Truffle.bid con ID: ${truffleId}`
    );
    const truffleScriptContent = `
      !function (p,i,x,e,l,j,s) {p[l] = p[l] || function (pixelId) {p[l].pixelId = pixelId};j = i.createElement(x), s = i.getElementsByTagName(x)[0], j.async = 1, j.src = e, s.parentNode.insertBefore(j, s)}(window, document, "script", "https://cdn.truffle.bid/p/inline-pixel.js", "ttf");
      ttf("${truffleId}");
    `;
    const script = document.createElement("script");
    script.id = TRUFFLE_SCRIPT_ID;
    script.innerHTML = truffleScriptContent;
    document.head.appendChild(script);
    logger.info("Pixel de Truffle.bid inyectado y activado.", {
      id: truffleId,
    });
    hasExecuted.current = true;
    logger.endGroup();
  }, [enabled]);
}
// Ruta correcta: src/shared/hooks/use-truffle-pixel.ts
