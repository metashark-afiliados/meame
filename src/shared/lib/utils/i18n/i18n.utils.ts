// RUTA: src/shared/lib/utils/i18n/i18n.utils.ts
/**
 * @file i18n.utils.ts
 * @description Aparato de utilidades puras y sin estado para la lógica de i18n.
 *              Ahora blindado para garantizar siempre un retorno de locale válido.
 * @version 2.3.0 (Resilient Fallback)
 * @author L.I.A. Legacy
 */
import {
  supportedLocales,
  defaultLocale,
  type Locale,
} from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";

logger.trace(
  "[i18n.utils.ts] Módulo de utilidades i18n cargado y listo para usar."
);

export function pathnameHasLocale(pathname: string): boolean {
  return supportedLocales.some(
    (locale: Locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
}

export function getCurrentLocaleFromPathname(pathname: string): Locale {
  if (!pathname || pathname === "/") {
    return defaultLocale;
  }

  const segments = pathname.split("/").filter(Boolean);
  const potentialLocale = segments[0] as Locale;

  if (supportedLocales.includes(potentialLocale)) {
    return potentialLocale;
  }

  logger.warn(
    `[i18n.utils] No se pudo determinar un locale válido desde "${pathname}". Usando fallback: ${defaultLocale}`
  );
  return defaultLocale;
}
