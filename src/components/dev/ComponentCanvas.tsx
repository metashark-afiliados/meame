// components/dev/ComponentCanvas.tsx
/**
 * @file ComponentCanvas.tsx
 * @description Componente orquestador para el Dev Component Canvas.
 * @version 5.1.0 (Prop Contract Fix): Corrige la clave de la prop pasada a
 *              ComponentMetadataPanel para alinearse con su contrato de API.
 * @version 5.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import Link from "next/link";
import { logger } from "@/shared/lib/logging";
import { ComponentCanvasHeader } from "./ComponentCanvasHeader";
import { ComponentMetadataPanel } from "./ComponentMetadataPanel";
import { loadComponentAndProps } from "./ComponentLoader";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

type CanvasContent = NonNullable<Dictionary["componentCanvas"]>;
type HeaderContent = NonNullable<Dictionary["componentCanvasHeader"]>;

interface ComponentCanvasProps {
  componentName?: string;
  locale: string;
  content: CanvasContent;
  headerContent: HeaderContent;
}

export async function ComponentCanvas({
  componentName,
  locale,
  content,
  headerContent,
}: ComponentCanvasProps): Promise<React.ReactElement> {
  logger.info(
    `[CanvasOrchestrator] Orquestando renderizado v5.1 para: ${
      componentName || "Indefinido"
    }`
  );

  if (!componentName) {
    return (
      <div className="text-center text-destructive">
        <h2 className="text-2xl font-bold">{content.errorNoComponentTitle}</h2>
        <p>{content.errorNoComponentDescription}</p>
        <p className="text-sm text-muted-foreground">
          <Link href={`/${locale}/dev`} className="underline text-primary">
            {content.errorNoComponentLink}
          </Link>
          .
        </p>
      </div>
    );
  }

  try {
    const { ComponentToRender, componentProps, appliedTheme, entry } =
      await loadComponentAndProps(componentName, locale);

    if (!headerContent) {
      throw new Error(
        "El contenido para 'componentCanvasHeader' no se encontró en el diccionario."
      );
    }

    return (
      <div className="border border-primary/50 rounded-lg p-6 bg-background/50 shadow-lg relative">
        <ComponentCanvasHeader entryName={entry.name} content={headerContent} />

        <ComponentMetadataPanel
          appliedTheme={appliedTheme}
          componentProps={componentProps}
          content={{
            // --- [INICIO DE CORRECCIÓN] ---
            metadataPanelPropsLabel: content.metadataPanelPropsLabel,
            // --- [FIN DE CORRECCIÓN] ---
          }}
        />

        <div className="relative z-10 p-4 border border-dashed border-primary/40 rounded-md min-h-[300px] flex items-center justify-center">
          <ComponentToRender {...componentProps} />
        </div>
      </div>
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      `[CanvasOrchestrator] Falla crítica al cargar "${componentName}":`,
      { error: errorMessage }
    );
    return (
      <div className="text-center text-destructive border border-red-500 p-8 rounded-lg">
        <h2 className="text-2xl font-bold">{content.errorLoadingTitle}</h2>
        <p className="text-muted-foreground">
          {content.errorLoadingDescription} &quot;
          <strong>{componentName}</strong>&quot;.
        </p>
        <p className="text-sm text-muted-foreground mt-2">{errorMessage}</p>
      </div>
    );
  }
}
// components/dev/ComponentCanvas.tsx
