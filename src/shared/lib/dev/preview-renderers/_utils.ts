// lib/dev/preview-renderers/_utils.ts
/**
 * @file _utils.ts
 * @description Utilidades para los renderizadores de previsualización atómicos.
 * @version 2.0.0 (Resilience & Fallback Logic): Implementa fallbacks seguros
 *              para manejar objetos de tema parciales, resolviendo todos los
 *              errores de tipo 'possibly undefined'.
 * @author RaZ Podestá - MetaShark Tech
 */
import type { AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";
import { logger } from "@/shared/lib/logging";

/**
 * @function getStyleFromTheme
 * @description Traduce un objeto de tema semántico a un objeto de estilo en línea
 *              compatible con el motor de renderizado de @vercel/og (Satori).
 *              Es resiliente a fragmentos de tema incompletos.
 * @param theme El objeto de tema ensamblado, que puede ser parcial.
 * @returns Un objeto con claves de estilo listas para ser usadas.
 */
export function getStyleFromTheme(theme: Partial<AssembledTheme>) {
  logger.trace("[Preview Utils] Mapeando tema a estilos en línea (v2.0)...");

  // --- [INICIO] LÓGICA DE RESILIENCIA Y FALLBACK ---
  // Se proveen valores de fallback seguros para cada propiedad.
  const colors = theme.colors ?? {};
  const geometry = theme.geometry ?? {};

  return {
    backgroundColor: `hsl(${colors.background || "0 0% 100%"})`,
    color: `hsl(${colors.foreground || "0 0% 3.9%"})`,
    borderColor: `hsl(${geometry["--border"] || "0 0% 89.8%"})`,
    primaryColor: `hsl(${colors.primary || "24.6 95% 53.1%"})`,
    primaryForegroundColor: `hsl(${colors.primaryForeground || "60 9.1% 97.8%"})`,
    mutedBackgroundColor: `hsl(${colors.muted || "60 4.8% 95.9%"})`,
    mutedForegroundColor: `hsl(${colors.mutedForeground || "25 5.3% 44.7%"})`,
    accentColor: `hsl(${colors.accent || "60 4.8% 95.9%"})`,
    accentForegroundColor: `hsl(${colors.accentForeground || "24 9.8% 10%"})`,
  };
  // --- [FIN] LÓGICA DE RESILIENCIA Y FALLBACK ---
}
// lib/dev/preview-renderers/_utils.ts
