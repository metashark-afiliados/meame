// RUTA: src/shared/lib/middleware/handlers/i18n.handler.ts
/**
 * @file i18n.handler.ts
 * @description Manejador de middleware para la internacionalización.
 * @version 7.2.0 (Redundant Import Pruning)
 * @author RaZ Podestá - MetaShark Tech
 */
import { NextResponse } from "next/server";
// --- [INICIO DE CORRECCIÓN DE HIGIENE DE CÓDIGO] ---
import { supportedLocales } from "../../i18n/i18n.config";
// --- [FIN DE CORRECCIÓN DE HIGIENE DE CÓDIGO] ---
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
    logger.trace(`[i18nHandler] Ruta ya localizada: ${pathname}. Omitiendo.`);
    return res;
  }

  // 2. Detección basada en país (Vercel Edge o API)
  const countryCode = req.headers.get("x-visitor-country");
  const localeFromCountry = getLocaleFromCountry(countryCode || undefined);

  if (localeFromCountry) {
    logger.info(
      `[i18nHandler] Locale detectado por país (${countryCode}): ${localeFromCountry}.`
    );
    const newUrl = new URL(`/${localeFromCountry}${pathname}`, req.url);
    return NextResponse.redirect(newUrl, 308);
  }

  // 3. Si el país es conocido pero el idioma no está soportado, redirigir a selección.
  if (countryCode && countryCode !== "unknown") {
    logger.warn(
      `[i18nHandler] País ${countryCode} no tiene un locale soportado. Redirigiendo a /select-language.`
    );
    const selectLangUrl = new URL(routes.selectLanguage.path(), req.url);
    selectLangUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(selectLangUrl);
  }

  // 4. Detección basada en el navegador.
  const localeFromBrowser = getLocaleFromBrowser(req);
  logger.info(
    `[i18nHandler] Locale detectado por navegador: ${localeFromBrowser}.`
  );
  const newUrl = new URL(`/${localeFromBrowser}${pathname}`, req.url);
  return NextResponse.redirect(newUrl, 308);
};
