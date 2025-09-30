// RUTA: src/shared/lib/middleware/handlers/visitorIntelligence.handler.ts
/**
 * @file visitorIntelligence.handler.ts
 * @description Manejador de middleware para enriquecer la petición con datos de
 *              inteligencia del visitante ("Aura") listos para producción.
 * @version 3.0.0 (Production Ready)
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import { UAParser } from "ua-parser-js";
import { getIpIntelligence } from "../../services/ip-intelligence.service";
import { type MiddlewareHandler } from "../engine/pipeline";
import { logger } from "../../logging";
import { KNOWN_BOTS } from "./config/known-bots";

export const visitorIntelligenceHandler: MiddlewareHandler = async (
  req,
  res
) => {
  const ip = req.ip ?? req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "";
  const lowerCaseUserAgent = userAgent.toLowerCase();
  const isBot = KNOWN_BOTS.some((bot) => lowerCaseUserAgent.includes(bot));
  const visitorType = isBot ? "bot" : "human";

  const uaParser = new UAParser(userAgent);
  const uaResult = uaParser.getResult();
  const deviceType = uaResult.device.type || "desktop";

  res.headers.set("x-visitor-type", visitorType);
  res.headers.set("x-visitor-device-type", deviceType);
  res.headers.set("x-visitor-browser-name", uaResult.browser.name || "unknown");
  res.headers.set("x-visitor-os-name", uaResult.os.name || "unknown");
  res.headers.set("x-visitor-ip", ip);

  const vercelCountry = req.geo?.country;
  let country = "unknown",
    city = "unknown",
    isProxy = false,
    source = "none";

  if (vercelCountry) {
    country = vercelCountry;
    city = req.geo?.city || "unknown";
    source = "Vercel Edge";
  } else if (!isBot) {
    const intelligence = await getIpIntelligence(ip);
    country = intelligence?.countryCode || "unknown";
    city = intelligence?.city || "unknown";
    isProxy = intelligence?.isProxy || false;
    source = "ip-api.com (Fallback)";
  }

  res.headers.set("x-visitor-country", country);
  res.headers.set("x-visitor-city", city);
  res.headers.set("x-visitor-proxy", String(isProxy));

  logger.info(
    `[VisitorIntelligence] Visitante: ${visitorType} desde ${country} (${source}) en ${deviceType}.`
  );

  return res;
};
