// RUTA: src/shared/lib/middleware/handlers/visitorIntelligence.handler.ts
/**
 * @file visitorIntelligence.handler.ts
 * @description Manejador de middleware v6.1. Es el "Perfilador Holístico" del pipeline,
 *              responsable de construir un pasaporte digital exhaustivo para cada visitante.
 *              Esta versión resuelve desalineamientos de tipos y de higiene de código.
 * @version 6.1.0 (Type & Linter Compliance)
 * @author L.I.A. Legacy
 */
import "server-only";
import { UAParser } from "ua-parser-js";
import { getIpIntelligence } from "../../services/ip-intelligence.service";
import { type MiddlewareHandler } from "../engine";
import { logger } from "../../logging";
import { KNOWN_BOTS } from "./config/known-bots";
import { createId } from "@paralleldrive/cuid2";

const FINGERPRINT_COOKIE = "visitor_fingerprint";
const FINGERPRINT_MAX_AGE = 63072000; // 2 años en segundos

export const visitorIntelligenceHandler: MiddlewareHandler = async (
  req,
  res
) => {
  const traceId = logger.startTrace("visitorIntelligenceHandler_v6.1");
  logger.startGroup(
    `[VisitorInt Handler] Perfilando petición holística: ${req.nextUrl.pathname}`
  );

  try {
    const supabaseAuthCookie = req.cookies.get(
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL!.split(".")[0].split("//")[1]}-auth-token`
    );
    let fingerprint = req.cookies.get(FINGERPRINT_COOKIE)?.value;
    const identity = supabaseAuthCookie ? "identified" : "anonymous";

    if (identity === "anonymous" && !fingerprint) {
      fingerprint = createId();
      res.cookies.set(FINGERPRINT_COOKIE, fingerprint, {
        path: "/",
        maxAge: FINGERPRINT_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      logger.traceEvent(
        traceId,
        `Nuevo visitante anónimo. Fingerprint generado: ${fingerprint}`
      );
    }
    logger.traceEvent(traceId, `Identidad del visitante: ${identity}`, {
      fingerprint,
    });

    const ip = req.ip ?? req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";
    const lowerCaseUserAgent = userAgent.toLowerCase();
    const isBot = KNOWN_BOTS.some((bot) => lowerCaseUserAgent.includes(bot));
    const visitorType = isBot ? "bot" : "human";

    const uaParser = new UAParser(userAgent);
    const uaResult = uaParser.getResult();
    const deviceType = uaResult.device.type || "desktop";

    logger.traceEvent(traceId, `User-Agent analizado.`, {
      type: visitorType,
      device: deviceType,
      browser: uaResult.browser.name,
      os: uaResult.os.name,
    });

    const vercelGeo = req.geo;
    let country = "unknown",
      region = "unknown",
      city = "unknown",
      latitude = "unknown",
      longitude = "unknown",
      isProxy = false,
      source = "none";

    if (vercelGeo?.country) {
      country = vercelGeo.country;
      region = vercelGeo.region || "unknown";
      city = vercelGeo.city || "unknown";
      latitude = vercelGeo.latitude || "unknown";
      longitude = vercelGeo.longitude || "unknown";
      source = "Vercel Edge";
      logger.traceEvent(traceId, `GeoIP obtenido de Vercel Edge.`, {
        country,
        region,
      });
    } else if (!isBot) {
      logger.traceEvent(traceId, `Iniciando fallback a API de GeoIP...`);
      const intelligence = await getIpIntelligence(ip);
      if (intelligence) {
        country = intelligence.countryCode || "unknown";
        region = intelligence.region || "unknown";
        city = intelligence.city || "unknown";
        latitude = String(intelligence.latitude || "unknown");
        longitude = String(intelligence.longitude || "unknown");
        isProxy = intelligence.isProxy || false;
        source = "ip-api.com (Fallback)";
        logger.traceEvent(traceId, `GeoIP obtenido de API de fallback.`, {
          country,
          isProxy,
        });
      }
    }

    const referer = req.headers.get("referer") || "direct";
    const acceptLanguage =
      req.headers.get("accept-language") || "not_specified";
    const fullUrl = req.nextUrl.href;
    const vercelRequestId = req.headers.get("x-vercel-id") || "none";

    logger.traceEvent(
      traceId,
      "Contexto de navegación y referencia capturado."
    );

    const headersToSet: Record<string, string> = {
      "x-visitor-identity": identity,
      "x-visitor-fingerprint": fingerprint || "none",
      "x-visitor-type": visitorType,
      "x-visitor-ip": ip,
      "x-visitor-country": country,
      "x-visitor-region": region,
      "x-visitor-city": city,
      "x-visitor-latitude": latitude,
      "x-visitor-longitude": longitude,
      "x-visitor-proxy": String(isProxy),
      "x-geoip-source": source,
      "x-visitor-user-agent": userAgent,
      "x-visitor-device-type": deviceType,
      "x-visitor-browser-name": uaResult.browser.name || "unknown",
      "x-visitor-browser-version": uaResult.browser.version || "unknown",
      "x-visitor-os-name": uaResult.os.name || "unknown",
      "x-visitor-os-version": uaResult.os.version || "unknown",
      "x-visitor-referer": referer,
      "x-visitor-accept-language": acceptLanguage,
      "x-visitor-full-url": fullUrl,
      "x-vercel-id": vercelRequestId,
    };

    for (const [key, value] of Object.entries(headersToSet)) {
      res.headers.set(key, value);
    }
    logger.success(
      `[VisitorInt Handler] Petición enriquecida holísticamente con ${
        Object.keys(headersToSet).length
      } cabeceras.`,
      { traceId }
    );

    return res;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "[VisitorInt Handler] Fallo crítico durante el perfilado del visitante.",
      { error: errorMessage, traceId }
    );
    return res;
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
};
