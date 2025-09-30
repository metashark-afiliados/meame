// RUTA: src/shared/lib/middleware/handlers/i18n.handler.ts
/**
 * @file i18n.handler.ts
 * @description Manejador de middleware para la internacionalización.
 * @version 8.0.0 (Granular Logging & Observability)
 * @author L.I.A. Legacy
 */
import { NextResponse } from "next/server";
import { supportedLocales } from "../../i18n/i18n.config";
import { getLocaleFromBrowser } from "../../i18n/locale-detector";
import { getLocaleFromCountry } from "../../i18n/country-locale-map";
import { type MiddlewareHandler } from "../engine";
import { routes } from "../../navigation";
import { logger } from "../../logging";

const localePathnameRegex = new RegExp(
  `^/(${supportedLocales.join("|")})(/.*)?$`,
  "i"
);

export const i18nHandler: MiddlewareHandler = (req, res) => {
  const { pathname } = req.nextUrl;

  // 1. Si la ruta ya tiene un locale, no hacemos nada.
  if (localePathnameRegex.test(pathname)) {
    logger.trace(
      `[i18nHandler] Decisión: Omitir. Razón: La ruta ya está localizada ('${pathname}').`
    );
    return res;
  }

  // 2. Detección por país (Vercel Edge).
  const countryCode = req.headers.get("x-visitor-country");
  const localeFromCountry = getLocaleFromCountry(countryCode || undefined);

  if (localeFromCountry) {
    const newUrl = new URL(`/${localeFromCountry}${pathname}`, req.url);
    logger.info(
      `[i18nHandler] Decisión: Redirigir. Razón: Locale '${localeFromCountry}' detectado por país ('${countryCode}').`,
      { redirectTo: newUrl.href }
    );
    return NextResponse.redirect(newUrl);
  }

  // 3. Si el país es conocido pero el idioma no está soportado, redirigir a selección.
  if (countryCode && countryCode !== "unknown") {
    const selectLangUrl = new URL(routes.selectLanguage.path(), req.url);
    selectLangUrl.searchParams.set("returnUrl", pathname);
    logger.warn(
      `[i18nHandler] Decisión: Redirigir a selección. Razón: País ('${countryCode}') no tiene un locale soportado.`,
      { redirectTo: selectLangUrl.href }
    );
    return NextResponse.redirect(selectLangUrl);
  }

  // 4. Fallback a detección por navegador.
  const localeFromBrowser = getLocaleFromBrowser(req);
  const newUrl = new URL(`/${localeFromBrowser}${pathname}`, req.url);
  logger.info(
    `[i18nHandler] Decisión: Redirigir. Razón: Fallback a locale de navegador ('${localeFromBrowser}').`,
    { redirectTo: newUrl.href }
  );
  return NextResponse.redirect(newUrl);
};
