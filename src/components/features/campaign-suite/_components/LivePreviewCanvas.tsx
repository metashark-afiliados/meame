// RUTA: src/components/features/campaign-suite/_components/LivePreviewCanvas.tsx
/**
 * @file LivePreviewCanvas.tsx
 * @description Orquestador de élite para el lienzo de previsualización (EDVI).
 *              Compone hooks y componentes atómicos para una máxima cohesión
 *              y una experiencia de "Modo Enfoque Sincronizado".
 * @version 12.0.0 (Hyper-Atomic & Focus-Aware)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCampaignDraftStore } from "@/shared/lib/stores/campaign-draft.store";
import { usePreviewTheme } from "@/shared/hooks/campaign-suite/use-preview-theme";
import { useIframe } from "@/shared/hooks/campaign-suite/use-iframe";
import { usePreviewFocus } from "@/shared/hooks/campaign-suite/use-preview-focus";
import { buildPreviewDictionary } from "@/shared/lib/utils/campaign-suite/preview.utils";
import {
  PreviewContent,
  PreviewLoadingOverlay,
  PreviewErrorOverlay,
} from "./LivePreviewCanvas/_components";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { logger } from "@/shared/lib/logging";

interface LivePreviewCanvasProps {
  content: {
    loadingTheme: string;
    errorLoadingTheme: string;
  };
}

export function LivePreviewCanvas({ content }: LivePreviewCanvasProps) {
  logger.info(
    "[LivePreviewCanvas] Renderizando orquestador v12.0 (Focus-Aware)."
  );

  // --- Capa de Lógica: Hooks Soberanos ---
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
        sandbox="allow-scripts allow-same-origin"
      />
      {iframeBody &&
        createPortal(
          <AnimatePresence>
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PreviewLoadingOverlay text={content.loadingTheme} />
              </motion.div>
            )}
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PreviewErrorOverlay
                  title={content.errorLoadingTheme}
                  details={error}
                />
              </motion.div>
            )}
            {theme && !isLoading && !error && (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <PreviewContent
                  draft={draft}
                  theme={theme}
                  dictionary={previewDictionary}
                  focusedSection={focusedSection}
                  sectionRefs={sectionRefs}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          iframeBody
        )}
    </motion.div>
  );
}
