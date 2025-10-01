// RUTA: src/shared/lib/dev/live-previews.config.ts
/**
 * @file live-previews.config.ts
 * @description SSoT para el registro de componentes para el EDVI.
 *              v9.1.0 (Elite Type Safety): Se erradica el uso de 'any',
 *              reemplazándolo con un contrato de tipos 'Record<string, unknown>'
 *              para cumplir con las reglas de linting y el Pilar II de Calidad.
 * @version 9.1.0
 * @author L.I.A. Legacy
 */
import type { ComponentType } from "react";
import { logger } from "@/shared/lib/logging";
import { sectionsConfig } from "@/shared/lib/config/sections.config";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CommentSectionClient } from "@/components/sections/comments/CommentSectionClient";

// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: SEGURIDAD DE TIPOS ABSOLUTA] ---
/**
 * @type PreviewableComponent
 * @description Contrato de tipo seguro para componentes en el registro de previsualización.
 *              Se utiliza `ComponentType<Record<string, unknown>>` para indicar que el
 *              componente puede aceptar cualquier prop, sin desactivar la verificación
 *              de tipos como lo haría 'any'. La seguridad de tipos real se delega
 *              al generador de props de fallback (`getFallbackProps`).
 */
type PreviewableComponent = ComponentType<Record<string, unknown>>;
// --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

/**
 * @function generateComponentMap
 * @description Genera dinámicamente el mapa de componentes a partir del manifiesto soberano `sectionsConfig`.
 * @returns {Record<string, PreviewableComponent>} El mapa de componentes listo y seguro.
 */
function generateComponentMap(): Record<string, PreviewableComponent> {
  const traceId = logger.startTrace("generateComponentMap_v9.1");
  logger.startGroup(`[LivePreviewRegistry] Generando registro dinámico...`, { traceId });

  const dynamicMap = Object.entries(sectionsConfig).reduce(
    (acc, [name, config]) => {
      if (name === "CommentSection") {
        acc[name] = CommentSectionClient;
      } else {
        acc[name] = config.component;
      }
      return acc;
    },
    {} as Record<string, PreviewableComponent>
  );

  const fullMap: Record<string, PreviewableComponent> = {
    ...dynamicMap,
    StandardHeader: Header,
    MinimalHeader: Header,
    StandardFooter: Footer,
  };

  logger.success(`[LivePreviewRegistry] Registro dinámico generado con ${Object.keys(fullMap).length} componentes.`, { traceId });
  logger.endGroup();
  logger.endTrace(traceId);

  return fullMap;
}

export const livePreviewComponentMap = generateComponentMap();
