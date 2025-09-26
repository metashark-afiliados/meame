// RUTA: src/components/features/campaign-suite/_components/LivePreviewCanvas.tsx
/**
 * @file LivePreviewCanvas.tsx
 * @description Orquestador de élite para el lienzo de previsualización (EDVI).
 *              Compone hooks y componentes atómicos para una máxima cohesión.
 * @version 11.0.0 (Atomic Architecture)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useCampaignDraftStore } from "@/shared/lib/stores/campaign-draft.store";
import { usePreviewTheme } from "@/shared/hooks/campaign-suite/use-preview-theme";
import { useIframe } from "@/shared/hooks/campaign-suite/use-iframe";
import { usePreviewFocus } from "@/shared/hooks/campaign-suite/use-preview-focus";
import { buildPreviewDictionary } from "@/shared/lib/utils/campaign-suite/preview.utils";
import {
  PreviewContent,
  PreviewLoadingOverlay,
  PreviewErrorOverlay,
} from "./LivePreviewCanvas/_components"; // <-- IMPORTACIÓN CORREGIDA
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { logger } from "@/shared/lib/logging";

interface LivePreviewCanvasProps {
  content: {
    loadingTheme: string;
    errorLoadingTheme: string;
  };
}

export function LivePreviewCanvas({ content }: LivePreviewCanvasProps) {
  logger.info("[LivePreviewCanvas] Renderizando orquestador v11.0 (Atomic).");

  // --- Capa de Lógica: Hooks ---
  const draft = useCampaignDraftStore((state) => state.draft);
  const { theme, isLoading, error } = usePreviewTheme();
  const { iframeRef, iframeBody } = useIframe();
  const { focusedSection, sectionRefs } = usePreviewFocus();

  // --- Capa de Transformación de Datos ---
  const previewDictionary = buildPreviewDictionary(
    draft.contentData,
    draft.layoutConfig,
    "it-IT"
  ) as Dictionary;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full bg-muted/20 p-2 rounded-lg sticky top-24"
    >
      <iframe
        ref={iframeRef}
        className="w-full h-full bg-background rounded-md border"
        title="Live Preview"
      />
      {iframeBody &&
        createPortal(
          <>
            {isLoading && <PreviewLoadingOverlay text={content.loadingTheme} />}
            {error && (
              <PreviewErrorOverlay
                title={content.errorLoadingTheme}
                details={error}
              />
            )}
            {theme && (
              <PreviewContent
                draft={draft}
                theme={theme}
                dictionary={previewDictionary}
                focusedSection={focusedSection}
                sectionRefs={sectionRefs}
              />
            )}
          </>,
          iframeBody
        )}
    </motion.div>
  );
}
