// RUTA: shared/lib/types/campaigns/step.types.ts
/**
 * @file step.types.ts
 * @description SSoT para los contratos de props compartidos entre los pasos del asistente.
 *              v1.1.0 (Module Load Observability): Se añade un log de traza
 *              al inicio del módulo para confirmar su carga, cumpliendo con el
 *              Pilar III de Observabilidad.
 * @version 1.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { logger } from "@/shared/lib/logging"; // Importa el logger

// --- INICIO DE MEJORA: OBSERVABILIDAD DE CARGA DE MÓDULO ---
logger.trace("[step.types.ts] Módulo de tipos de paso de campaña cargado y listo para usar.");
// --- FIN DE MEJORA: OBSERVABILIDAD DE CARGA DE MÓDULO ---

// El tipo genérico 'TContent' ahora representa la forma completa del objeto
// de contenido esperado, incluyendo la clave raíz (ej. { step0: { ... } }).
export interface StepProps<TContent> {
  content: TContent;
}
