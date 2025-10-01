// RUTA: src/components/features/campaign-suite/_components/LivePreviewCanvas.tsx
/**
 * @file LivePreviewCanvas.tsx
 * @description Orquestador de élite para el lienzo de previsualización (EDVI).
 *              Ahora es un componente de cliente más puro que recibe todos los
 *              datos del servidor como props, eliminando el doble fetch.
 * @version 18.0.0 (Pure Data Consumer)
 *@author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { createPortal } from "react-dom";
import { usePreviewTheme } from "@/shared/hooks/campaign-suite/use-preview-theme";
import { useIframe } from "@/shared/hooks/campaign-suite/use-iframe";
import { usePreviewFocus } from "@/shared/hooks/campaign-suite/use-preview-focus";
import { buildPreviewDictionary } from "@/shared/lib/utils/campaign-suite/preview.utils";
import {
  PreviewContent,
  PreviewErrorOverlay,
} from "./LivePreviewCanvas/_components";
import { useAssembledDraft } from "@/shared/hooks/campaign-suite/use-assembled-draft.hook";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { logger } from "@/shared/lib/logging";
import type { LoadedFragments } from "@/shared/lib/actions/campaign-suite";
import type { BaviManifest } from "@/shared/lib/schemas/bavi/bavi.manifest.schema";

interface LivePreviewCanvasProps {
  content: {
    errorLoadingTheme: string;
  };
  loadedFragments: LoadedFragments;
  baviManifest: BaviManifest;
  dictionary: Dictionary;
}

export function LivePreviewCanvas({
  content,
  loadedFragments,
  baviManifest,
  dictionary,
}: LivePreviewCanvasProps) {
  logger.info("[LivePreviewCanvas] Renderizando orquestador puro v18.0.");

  const draft = useAssembledDraft();
  const { theme, error: themeError } = usePreviewTheme(loadedFragments);
  const { iframeRef, iframeBody } = useIframe();
  const { focusedSection, sectionRefs } = usePreviewFocus();

  const draftDictionary = buildPreviewDictionary(
    draft.contentData,
    draft.layoutConfig,
    "it-IT"
  );
  // Ensambla el diccionario final fusionando el base con el del borrador.
  const finalDictionary = {
    ...dictionary,
    ...draftDictionary,
  } as Dictionary;

  return (
    <div className="h-full bg-muted/20 p-2 rounded-lg sticky top-24">
      <iframe
        ref={iframeRef}
        className="w-full h-full bg-background rounded-md border"
        title="Live Preview"
        sandbox="allow-scripts allow-same-origin"
      />
      {iframeBody &&
        createPortal(
          <>
            {themeError && (
              <PreviewErrorOverlay
                title={content.errorLoadingTheme}
                details={themeError}
              />
            )}
            {theme && !themeError && (
              <PreviewContent
                draft={draft}
                theme={theme}
                baviManifest={baviManifest}
                dictionary={finalDictionary}
                focusedSection={focusedSection}
                sectionRefs={sectionRefs}
              />
            )}
          </>,
          iframeBody
        )}
    </div>
  );
}
