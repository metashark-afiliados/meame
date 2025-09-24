// lib/config/theming.config.ts
/**
 * @file theming.config.ts
 * @description SSoT para la configuración del sistema de Theming.
 *              Define el mapeo entre los prefijos de la Nomenclatura
 *              Estructurada de Trazos (NET) y sus directorios correspondientes.
 *              v1.1.0 (DCC Global Theme Prefix)
 * @version 1.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { logger } from "@/shared/lib/logging";

logger.trace(
  "[Theming Config] Módulo de configuración de theming (v1.1.0) cargado."
);

/**
 * @const netTracePrefixToPathMap
 * @description El mapa canónico que traduce un prefijo de trazo NET
 *              (ej. 'cp') a su directorio de fragmentos correspondiente.
 */
export const netTracePrefixToPathMap: Record<string, string> = {
  cp: "colors", // Color Palette (para campañas)
  ft: "fonts", // Fonts (para campañas)
  rd: "radii", // Radius (geometría para campañas)
  dcc: "dcc-global-colors", // <-- NUEVO: Prefijo para los colores globales del DCC
  // Futuros prefijos se añadirán aquí.
};
