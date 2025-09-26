// RUTA: src/shared/lib/actions/campaign-suite/deleteDraft.action.ts
/**
 * @file deleteDraft.action.ts
 * @description Server Action soberana y de élite para eliminar de forma segura
 *              un borrador de campaña de la base de datos MongoDB.
 * @version 2.0.0 (Production-Ready User Context)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { z } from "zod";
import { logger } from "@/shared/lib/logging";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { createServerClient } from "@/shared/lib/supabase/server"; // <-- IMPORTACIÓN CLAVE
import type { ActionResult } from "@/shared/lib/types/actions.types";
import type { CampaignDraftDb } from "@/shared/lib/schemas/campaigns/draft.schema";

export async function deleteDraftAction(
  draftId: string
): Promise<ActionResult<{ deletedCount: number }>> {
  const traceId = logger.startTrace("deleteDraftAction_v2.0");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- GUARDIA DE SEGURIDAD SOBERANA ---
  if (!user) {
    logger.warn("[Action] Intento no autorizado de eliminar borrador.", {
      traceId,
    });
    return { success: false, error: "Acción no autorizada." };
  }

  logger.warn(`[Action] Petición para eliminar borrador de DB: ${draftId}`, {
    traceId,
    userId: user.id, // <-- LOGGING VERBOSO
  });

  try {
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

    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection<CampaignDraftDb>("campaign_drafts");

    // --- LÓGICA DE PRODUCCIÓN ---
    // La consulta ahora es segura y contextual al usuario.
    const result = await collection.deleteOne({
      draftId: validDraftId,
      userId: user.id,
    });

    if (result.deletedCount > 0) {
      logger.success(
        "[Action] Borrador eliminado exitosamente de la base de datos.",
        { draftId: validDraftId, traceId }
      );
    } else {
      logger.warn(
        "[Action] No se encontró ningún borrador para eliminar que coincida con los criterios.",
        { draftId: validDraftId, userId: user.id, traceId }
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
    logger.endTrace(traceId);
  }
}
