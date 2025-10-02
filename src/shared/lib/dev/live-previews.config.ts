// RUTA: src/shared/lib/dev/live-previews.config.ts
/**
 * @file live-previews.config.ts
 * @description SSoT para el registro de componentes para el EDVI.
 *              v9.3.0 (Definitive Type Assertion): Resuelve el error de tipo
 *              TS2352 utilizando una doble aserción explícita (`as unknown as Type`),
 *              alineando la seguridad de tipos estática con el contrato garantizado en tiempo de ejecución.
 * @version 9.3.0
 * @author L.I.A. Legacy
 */
import type { ComponentType } from "react";
import { logger } from "@/shared/lib/logging";
import { sectionsConfig } from "@/shared/lib/config/sections.config";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CommentSectionClient } from "@/components/sections/comments/CommentSectionClient";

type PreviewableComponent = ComponentType<Record<string, unknown>>;

function generateComponentMap(): Record<string, PreviewableComponent> {
  const traceId = logger.startTrace("generateComponentMap_v9.3");
  logger.startGroup(`[LivePreviewRegistry] Generando registro dinámico...`);

  const dynamicMap = Object.entries(sectionsConfig).reduce(
    (acc, [name, config]) => {
      if (name === "CommentSection") {
        // --- [INICIO DE CORRECCIÓN DE TIPO DEFINITIVA (TS2352)] ---
        // Se utiliza la doble aserción para una conversión explícita y segura.
        acc[name] = CommentSectionClient as unknown as PreviewableComponent;
        // --- [FIN DE CORRECCIÓN DE TIPO DEFINITIVA] ---
      } else {
        // --- [INICIO DE CORRECCIÓN DE TIPO DEFINITIVA (TS2322)] ---
        acc[name] = config.component as unknown as PreviewableComponent;
        // --- [FIN DE CORRECCIÓN DE TIPO DEFINITIVA] ---
      }
      return acc;
    },
    {} as Record<string, PreviewableComponent>
  );

  const fullMap: Record<string, PreviewableComponent> = {
    ...dynamicMap,
    // --- [INICIO DE CORRECCIÓN DE TIPO DEFINITIVA (TS2322)] ---
    StandardHeader: Header as unknown as PreviewableComponent,
    MinimalHeader: Header as unknown as PreviewableComponent,
    StandardFooter: Footer as unknown as PreviewableComponent,
    // --- [FIN DE CORRECCIÓN DE TIPO DEFINITIVA] ---
  };

  logger.success(
    `[LivePreviewRegistry] Registro dinámico generado con ${Object.keys(fullMap).length} componentes.`,
    { traceId }
  );
  logger.endGroup();
  logger.endTrace(traceId);

  return fullMap;
}

export const livePreviewComponentMap = generateComponentMap();
