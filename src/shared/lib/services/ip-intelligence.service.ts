// RUTA: src/shared/lib/services/ip-intelligence.service.ts
/**
 * @file ip-intelligence.service.ts
 * @description SSoT para la obtención de datos de inteligencia de IP, ahora
 *              con reconocimiento de entorno de desarrollo para prevenir
 *              errores de localhost.
 * @version 3.0.0 (Context-Aware & Production Ready)
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

// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE] ---

const LOCALHOST_IPS = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

/**
 * @function getIpIntelligence
 * @description Obtiene datos de geolocalización para una IP pública.
 *              Si se detecta una IP de localhost, omite la llamada a la API
 *              y devuelve null para una degradación elegante.
 * @version 3.0.0
 * @param {string} ip - La dirección IP a consultar.
 * @returns {Promise<IpIntelligence | null>} Los datos de inteligencia o null.
 */
export async function getIpIntelligence(
  ip: string
): Promise<IpIntelligence | null> {
  // 1. Guardia de Contexto de Desarrollo
  if (LOCALHOST_IPS.has(ip)) {
    logger.trace(
      "[IpIntelligenceService] IP de localhost detectada. Omitiendo llamada a la API de GeoIP de fallback.",
      { ip }
    );
    return null;
  }

  // 2. Lógica de Producción (sin cambios, pero ahora protegida)
  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,countryCode,city,proxy,query`
    );
    if (!response.ok) {
      throw new Error(`La API de IP devolvió el estado: ${response.status}`);
    }
    const data = await response.json();

    if (data.status !== "success") {
      // Mensaje de error mejorado para más contexto
      throw new Error(
        `La API de IP devolvió un error: ${data.message || "Respuesta sin mensaje."}`
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
