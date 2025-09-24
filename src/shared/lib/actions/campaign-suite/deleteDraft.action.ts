// app/[locale]/(dev)/dev/campaign-suite/_actions/deleteDraft.action.ts
/**
 * @file deleteDraft.action.ts
 * @description Server Action soberana y de élite para eliminar de forma segura
 *              un borrador de campaña de la base de datos MongoDB.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { z } from "zod";
import { logger } from "@/shared/lib/logging";
import { connectToDatabase } from "@/shared/lib/mongodb";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import type { CampaignDraftDb } from "@/shared/lib/schemas/campaigns/draft.schema";

// En un sistema de producción, este ID vendría de la sesión de Supabase.
const MOCK_USER_ID = "user__metashark_dev";

/**
 * @function deleteDraftAction
 * @description Elimina un único documento de borrador de la colección `campaign_drafts`
 *              que coincida con el draftId y el userId.
 * @param {string} draftId - El ID del borrador a eliminar (debe ser un CUID2 válido).
 * @returns {Promise<ActionResult<{ deletedCount: number }>>} El resultado de la operación.
 */
export async function deleteDraftAction(
  draftId: string
): Promise<ActionResult<{ deletedCount: number }>> {
  const traceId = logger.startTrace("deleteDraftAction");
  logger.warn(`[Action] Petición para eliminar borrador de DB: ${draftId}`, {
    traceId,
    userId: MOCK_USER_ID,
  });

  try {
    // 1. Validar la entrada (Guardia de Seguridad de Tipos)
    const validation = z.string().cuid2().safeParse(draftId);
    if (!validation.success) {
      logger.error("[Action] El ID de borrador proporcionado es inválido.", {
        errors: validation.error.flatten(),
        receivedId: draftId,
        traceId,
      });
      return { success: false, error: "El ID del borrador es inválido." };
    }
    const validDraftId = validation.data;

    // 2. Conectar a la Base de Datos y obtener la colección
    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection<CampaignDraftDb>("campaign_drafts");

    // 3. Ejecutar la operación de eliminación segura
    const result = await collection.deleteOne({
      draftId: validDraftId,
      userId: MOCK_USER_ID, // Guardia de Seguridad de Contexto
    });

    // 4. Observabilidad del Resultado
    if (result.deletedCount > 0) {
      logger.success(
        "[Action] Borrador eliminado exitosamente de la base de datos.",
        { draftId: validDraftId, traceId }
      );
    } else {
      logger.warn(
        "[Action] No se encontró ningún borrador para eliminar en la DB que coincida con los criterios.",
        { draftId: validDraftId, userId: MOCK_USER_ID, traceId }
      );
    }

    return { success: true, data: { deletedCount: result.deletedCount } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[Action] Fallo crítico al intentar eliminar el borrador.", {
      error: errorMessage,
      traceId,
    });
    return {
      success: false,
      error: "No se pudo completar la eliminación en la base de datos.",
    };
  } finally {
    // 5. Limpieza y Finalización del Trace
    logger.endTrace(traceId);
  }
}
// app/[locale]/(dev)/dev/campaign-suite/_actions/deleteDraft.action.ts
