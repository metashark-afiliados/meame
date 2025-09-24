// app/api/component-preview/[componentName]/route.ts
/**
 * @file route.ts
 * @description Endpoint de API para generar vistas previas de componentes.
 *              v3.2.0 (Definitive Build Fix): Resuelve el error de parseo de JSX
 *              invocando el componente de error con React.createElement.
 * @version 3.2.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { ImageResponse } from "@vercel/og";
import React from "react";
import { renderPreviewComponent } from "@/shared/lib/dev/preview-renderer";
import { ErrorPreview } from "@/components/dev/ErrorPreview";

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
// app/api/component-preview/[componentName]/route.ts
