// RUTA: shared/lib/types/sections.types.ts
/**
 * @file sections.types.ts
 * @description SSoT para los contratos de tipos compartidos de los componentes de sección.
 *              v1.1.0 (Module Load Observability): Se añade un log de traza
 *              al inicio del módulo para confirmar su carga, cumpliendo con el
 *              Pilar III de Observabilidad.
 * @version 1.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging"; // Importa el logger

// --- INICIO DE MEJORA: OBSERVABILIDAD DE CARGA DE MÓDULO ---
logger.trace(
  "[sections.types.ts] Módulo de tipos de secciones cargado y listo para usar."
);
// --- FIN DE MEJORA: OBSERVABILIDAD DE CARGA DE MÓDULO ---

/**
 * @interface SectionProps
 * @description Contrato base que TODOS los componentes de sección deben cumplir.
 *              Asegura que cada sección reciba su contenido validado y el locale actual.
 * @template T - El tipo de la clave del diccionario para el contenido de esta sección.
 */
export interface SectionProps<T extends keyof Dictionary> {
  content: NonNullable<Dictionary[T]>;
  locale: Locale;
}
