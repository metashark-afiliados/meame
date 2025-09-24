// RUTA: src/shared/lib/services/ip-intelligence.service.ts
/**
 * @file ip-intelligence.service.ts
 * @description SSoT para la obtención de datos de inteligencia de IP, con logging de producción.
 * @version 2.0.0 (Production Ready)
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import { logger } from "../logging";

export interface IpIntelligence {
  ip: string;
  countryCode: string | null;
  city: string | null;
  isProxy: boolean;
}

export async function getIpIntelligence(
  ip: string
): Promise<IpIntelligence | null> {
  // En producción, no logueamos la traza para no generar ruido, solo errores.
  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,countryCode,city,proxy,query`
    );
    if (!response.ok) {
      throw new Error(`La API de IP devolvió el estado: ${response.status}`);
    }
    const data = await response.json();

    if (data.status !== "success") {
      throw new Error(
        `La API de IP devolvió un error: ${data.message || "Desconocido"}`
      );
    }
    return {
      ip: data.query,
      countryCode: data.countryCode || null,
      city: data.city || null,
      isProxy: data.proxy || false,
    };
  } catch (error) {
    logger.error(
      "[IpIntelligenceService] Fallo al consultar la API de GeoIP de fallback.",
      { error, ip }
    );
    return null;
  }
}
