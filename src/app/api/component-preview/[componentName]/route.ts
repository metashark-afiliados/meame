// RUTA: src/app/api/component-preview/[componentName]/route.ts
/**
 * @file route.ts
 * @description Endpoint de API para generar vistas previas de componentes.
 *              v4.0.0 (Sovereign Path Restoration): Se corrige la ruta de importación
 *              para alinearse con la Arquitectura Canónica Soberana (ACS).
 * @version 4.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { ImageResponse } from "@vercel/og";
import React from "react";
import { renderPreviewComponent } from "@/shared/lib/dev/preview-renderer";
// --- [INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
// Se corrige la ruta de importación para apuntar a la SSoT canónica del componente.
import { ErrorPreview } from "@/components/features/dev-tools/ErrorPreview";
// --- [FIN DE REFACTORIZACIÓN ARQUITECTÓNICA] ---

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: { componentName: string } }
) {
  const componentName = params.componentName;
  const renderResult = await renderPreviewComponent(componentName);

  const { jsx, width, height } = renderResult || {
    jsx: React.createElement(ErrorPreview, { componentName }),
    width: 600,
    height: 338,
  };

  return new ImageResponse(jsx, {
    width,
    height,
  });
}
// RUTA: src/app/api/component-preview/[componentName]/route.ts
