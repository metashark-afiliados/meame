// RUTA: src/shared/hooks/campaign-suite/use-preview-focus.ts
/**
 * @file use-preview-focus.ts
 * @description Hook atómico para gestionar el efecto secundario de scroll
 *              en el lienzo de previsualización.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useEffect, useRef } from "react";
import { useFocusStore } from "@/components/features/campaign-suite/_context/FocusContext";
import { logger } from "@/shared/lib/logging";

export function usePreviewFocus() {
  const focusedSection = useFocusStore((state) => state.focusedSection);
  const sectionRefs = useRef<Record<string, HTMLElement>>({});

  useEffect(() => {
    if (focusedSection && sectionRefs.current[focusedSection]) {
      logger.trace(`[usePreviewFocus] Enfocando sección: ${focusedSection}`);
      sectionRefs.current[focusedSection].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [focusedSection]);

  return { focusedSection, sectionRefs };
}
