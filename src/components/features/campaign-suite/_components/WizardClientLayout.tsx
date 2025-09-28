// RUTA: src/components/features/campaign-suite/_components/WizardClientLayout.tsx
/**
 * @file WizardClientLayout.tsx
 * @description Componente de presentación puro para el layout de la SDC.
 * @version 14.0.0 (Data Flow Propagation)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { DynamicIcon } from "@/components/ui";
import { LivePreviewCanvas } from "./LivePreviewCanvas";
import { logger } from "@/shared/lib/logging";
import type { LoadedFragments } from "@/shared/lib/actions/campaign-suite";

interface WizardClientLayoutProps {
  children: React.ReactNode;
  previewContent: {
    loadingTheme: string;
    errorLoadingTheme: string;
  };
  isLoadingDraft: boolean;
  loadedFragments: LoadedFragments;
}

export function WizardClientLayout({
  children,
  previewContent,
  isLoadingDraft,
  loadedFragments,
}: WizardClientLayoutProps): React.ReactElement {
  logger.info(
    "[WizardClientLayout] Renderizando layout de presentación v14.0."
  );

  if (isLoadingDraft) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <DynamicIcon
          name="LoaderCircle"
          className="w-12 h-12 animate-spin text-primary"
        />
        <p className="mt-4 text-lg font-semibold text-foreground">
          Cargando tu borrador...
        </p>
        <p className="text-muted-foreground">
          Sincronizando con la base de datos.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="lg:col-span-1">{children}</div>
      <div className="lg:col-span-1 h-[calc(100vh-12rem)] hidden lg:block">
        <LivePreviewCanvas
          content={previewContent}
          loadedFragments={loadedFragments}
        />
      </div>
    </div>
  );
}
// RUTA: src/components/features/campaign-suite/_components/WizardClientLayout.tsx
