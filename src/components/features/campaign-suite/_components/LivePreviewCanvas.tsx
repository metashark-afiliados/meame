// RUTA: src/components/features/campaign-suite/_components/LivePreviewCanvas.tsx
/**
 * @file LivePreviewCanvas.tsx
 * @description Orquestador de élite para el lienzo de previsualización (EDVI).
 * @version 16.0.0 (ACS Path & Build Integrity Restoration)
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
import { useLivePreviewAssets } from "@/shared/hooks/campaign-suite/use-live-preview-assets";
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
  logger.info("[LivePreviewCanvas] Renderizando orquestador v16.0.");

  const draft = useCampaignDraftStore((state) => state.draft);
  const {
    theme,
    isLoading: isThemeLoading,
    error: themeError,
  } = usePreviewTheme();
  const {
    assets,
    isLoading: areAssetsLoading,
    error: assetsError,
  } = useLivePreviewAssets();
  const { iframeRef, iframeBody } = useIframe();
  const { focusedSection, sectionRefs } = usePreviewFocus();

  const isLoading = isThemeLoading || areAssetsLoading;
  const error = themeError || assetsError;

  const draftDictionary = buildPreviewDictionary(
    draft.contentData,
    draft.layoutConfig,
    "it-IT"
  );

  const finalDictionary = {
    ...assets?.dictionary,
    ...draftDictionary,
  } as Dictionary;

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
            {isLoading && <PreviewLoadingOverlay text={content.loadingTheme} />}
            {error && (
              <PreviewErrorOverlay
                title={content.errorLoadingTheme}
                details={error}
              />
            )}
            {theme && assets && !isLoading && !error && (
              <PreviewContent
                draft={draft}
                theme={theme}
                baviManifest={assets.baviManifest}
                dictionary={finalDictionary}
                focusedSection={focusedSection}
                sectionRefs={sectionRefs}
              />
            )}
          </AnimatePresence>,
          iframeBody
        )}
    </motion.div>
  );
}
