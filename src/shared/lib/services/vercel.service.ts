// RUTA: shared/lib/services/vercel.service.ts
/**
 * @file vercel.service.ts
 * @description SSoT para interactuar con la API de Vercel.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";
import { logger } from "@/shared/lib/logging";

const VERCEL_API_URL = "https://api.vercel.com/v1/analytics";
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID; // Necesitaremos el ID del proyecto

export async function getAnalyticsForPath(path: string): Promise<any> {
  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    throw new Error(
      "Las variables de entorno de Vercel no están configuradas."
    );
  }

  // Ejemplo de URL para obtener visitantes y fuentes de una ruta específica
  const url = `${VERCEL_API_URL}/projects/${VERCEL_PROJECT_ID}/query?path=${path}&metric=visitors,sources`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${VERCEL_API_TOKEN}`,
      },
      next: { revalidate: 3600 }, // Cachear por 1 hora
    });
    if (!response.ok) {
      throw new Error(
        `La API de Vercel respondió con el estado: ${response.status}`
      );
    }
    return await response.json();
  } catch (error) {
    logger.error("Fallo al contactar la API de Vercel Analytics.", { error });
    return null;
  }
}
