// RUTA: app/[locale]/(dev)/nos3/_actions/getSessionEvents.action.ts
/**
 * @file getSessionEvents.action.ts
 * @description Server Action de élite para obtener todos los eventos de una
 *              sesión específica de `nos3` desde Vercel Blob.
 *              v1.1.0 (Internal SSoT): Se alinea con la SSoT de tipos interna.
 * @version 1.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { list } from "@vercel/blob";
import type { eventWithTime } from "@/shared/lib/types/rrweb.types";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";

/**
 * @function getSessionEventsAction
 * @description Obtiene todos los archivos de eventos para un sessionId, los fusiona
 *              y los ordena por timestamp.
 * @param {string} sessionId - El ID de la sesión a recuperar.
 * @returns {Promise<ActionResult<eventWithTime[]>>} Un array de eventos listos para reproducir.
 */
export async function getSessionEventsAction(
  sessionId: string
): Promise<ActionResult<eventWithTime[]>> {
  logger.info(
    `[nos3-data-layer] Solicitando eventos para la sesión: ${sessionId}`
  );
  try {
    const { blobs } = await list({
      prefix: `sessions/${sessionId}/`,
      mode: "expanded",
    });

    if (blobs.length === 0) {
      logger.warn(
        `[nos3-data-layer] No se encontraron blobs para la sesión: ${sessionId}`
      );
      return {
        success: false,
        error: "No se encontraron datos para esta sesión.",
      };
    }

    const eventsPromises = blobs.map(async (blob) => {
      const response = await fetch(blob.url);
      if (!response.ok) {
        throw new Error(`Fallo al descargar el blob: ${blob.url}`);
      }
      return (await response.json()) as eventWithTime[];
    });

    const eventChunks = await Promise.all(eventsPromises);
    const allEvents = eventChunks.flat();

    allEvents.sort((a, b) => a.timestamp - b.timestamp);

    logger.success(
      `[nos3-data-layer] Se recuperaron y ensamblaron ${allEvents.length} eventos para la sesión ${sessionId}.`
    );
    return { success: true, data: allEvents };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error desconocido en Vercel Blob";
    logger.error(
      `[nos3-data-layer] Fallo al obtener los eventos para la sesión ${sessionId}.`,
      {
        error: errorMessage,
      }
    );
    return {
      success: false,
      error: "No se pudieron recuperar los eventos de la sesión.",
    };
  }
}
