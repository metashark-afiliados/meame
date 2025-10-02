// RUTA: src/shared/lib/middleware/handlers/i18n.handler.ts
/**
 * @file i18n.handler.ts
 * @description Manejador de middleware para i18n, ahora con redirección contextual
 *              inteligente para preservar el viaje del usuario (MEA/UX).
 * @version 9.0.0 (Context-Aware Redirection & MEA/UX)
 *@author L.I.A. Legacy
 */
import { NextResponse } from "next/server";
import { supportedLocales } from "../../i18n/i18n.config";
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

  if (localePathnameRegex.test(pathname)) {
    logger.trace(
      `[i18nHandler] Decisión: Omitir. Razón: La ruta ya está localizada ('${pathname}').`
    );
    return res;
  }

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

  // --- [INICIO DE REFACTORIZACIÓN MEA/UX v9.0.0] ---
  // Si no se puede determinar un locale, redirigimos a la página de selección
  // PERO AHORA pasamos la ruta original a la que el usuario intentaba acceder.
  const selectLangUrl = new URL(routes.selectLanguage.path(), req.url);
  selectLangUrl.searchParams.set("returnUrl", pathname);
  logger.warn(
    `[i18nHandler] Decisión: Redirigir a selección. Razón: No se pudo determinar un locale por GeoIP.`,
    { redirectTo: selectLangUrl.href, returnUrl: pathname }
  );
  return NextResponse.redirect(selectLangUrl);
  // --- [FIN DE REFACTORIZACIÓN MEA/UX v9.0.0] ---
};
