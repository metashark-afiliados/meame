// RUTA: src/shared/lib/middleware/handlers/i18n.handler.ts
/**
 * @file i18n.handler.ts
 * @description Manejador de middleware i18n, consciente de rutas públicas
 *              y forjado con observabilidad y resiliencia de élite para prevenir
 *              bucles de redirección.
 * @version 10.2.0 (Elite Code Hygiene & Type Safety)
 * @author L.I.A. Legacy
 */
import "server-only";
import { NextResponse } from "next/server";
import { supportedLocales } from "../../i18n/i18n.config";
import { getLocaleFromCountry } from "../../i18n/country-locale-map";
import { getLocaleFromBrowser } from "../../i18n/locale-detector";
import { type MiddlewareHandler } from "../engine";
import { routes } from "../../navigation";
import { logger } from "../../logging";

// SSoT para rutas públicas que NUNCA deben ser prefijadas con un locale.
const PUBLIC_FILE = /\.(.*)$/;
const LOCALE_FREE_PATHS = [
  "/select-language",
  // Añadir aquí otras rutas si fuera necesario, ej: '/api/public'
];

export const i18nHandler: MiddlewareHandler = (req, res) => {
  const traceId = logger.startTrace("i18nHandler_v10.2");
  logger.startGroup(`[i18nHandler] Procesando ruta: ${req.nextUrl.pathname}`);

  try {
    const { pathname } = req.nextUrl;

    // --- GUARDIA DE RESILIENCIA 1: Rutas ya localizadas ---
    const pathnameHasLocale = supportedLocales.some(
      (locale) =>
        pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );
    if (pathnameHasLocale) {
      logger.traceEvent(
        traceId,
        "Decisión: Omitir. Razón: Ruta ya localizada."
      );
      return res;
    }

    // --- GUARDIA DE RESILIENCIA 2: Rutas públicas exentas ---
    if (PUBLIC_FILE.test(pathname) || LOCALE_FREE_PATHS.includes(pathname)) {
      logger.traceEvent(
        traceId,
        "Decisión: Omitir. Razón: Ruta pública exenta de localización."
      );
      return res;
    }

    // --- LÓGICA DE DETECCIÓN Y REDIRECCIÓN ---
    let targetLocale;

    // Estrategia 1: Detección por GeoIP (realizada en visitorIntelligenceHandler)
    const countryCode = req.headers.get("x-visitor-country");
    const localeFromCountry = getLocaleFromCountry(countryCode || undefined);

    if (localeFromCountry) {
      targetLocale = localeFromCountry;
      logger.traceEvent(
        traceId,
        `Decisión: Locale '${targetLocale}' detectado por GeoIP (${countryCode}).`
      );
    } else {
      // Estrategia 2: Fallback a cabeceras del navegador
      const localeFromBrowser = getLocaleFromBrowser(req);
      targetLocale = localeFromBrowser;
      logger.traceEvent(
        traceId,
        `Decisión: Locale '${targetLocale}' detectado por cabeceras del navegador.`
      );
    }

    if (!targetLocale) {
      // --- [INICIO DE REFACTORIZACIÓN DE TIPO (TS2554)] ---
      // La función `path` de `selectLanguage` no espera argumentos.
      const selectLangUrl = new URL(routes.selectLanguage.path(), req.url);
      // --- [FIN DE REFACTORIZACIÓN DE TIPO (TS2554)] ---
      selectLangUrl.searchParams.set("returnUrl", pathname);
      logger.warn(
        `[i18nHandler] Decisión: Redirigir a selección. Razón: No se pudo determinar un locale.`,
        { redirectTo: selectLangUrl.href, returnUrl: pathname, traceId }
      );
      return NextResponse.redirect(selectLangUrl);
    }

    // Construir y ejecutar la redirección
    const newUrl = new URL(`/${targetLocale}${pathname}`, req.url);
    logger.info(
      `[i18nHandler] Decisión: Redirigir. Razón: Aplicando locale detectado.`,
      { redirectTo: newUrl.href, traceId }
    );
    return NextResponse.redirect(newUrl);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[i18nHandler] Fallo crítico no controlado.", {
      error: errorMessage,
      traceId,
    });
    return res; // En caso de error, no interrumpir la petición
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
};
