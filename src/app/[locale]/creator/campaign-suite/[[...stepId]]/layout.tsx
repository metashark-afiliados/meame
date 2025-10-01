// RUTA: src/app/[locale]/creator/campaign-suite/[[...stepId]]/layout.tsx
/**
 * @file layout.tsx
 * @description Layout de marcador de posición (placeholder) para la reconstrucción fundamental.
 * @version 1.0.0 (Reconstrucción)
 *@author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { logger } from "@/shared/lib/logging";

export default function PlaceholderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const routePath = "/creator/campaign-suite/[[...stepId]]";
  logger.info(`[Placeholder] Renderizando layout para: ${routePath}`);

  return <>{children}</>;
}
