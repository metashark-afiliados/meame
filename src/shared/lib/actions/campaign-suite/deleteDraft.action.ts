// RUTA: src/shared/lib/actions/campaign-suite/deleteDraft.action.ts
/**
 * @file deleteDraft.action.ts
 * @description Server Action de producción para eliminar un borrador de campaña.
 * @version 1.0.0 (Atomized)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { z } from "zod";
import { createServerClient } from "@/shared/lib/supabase/server";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";

export async function deleteDraftAction(
  draftId: string
): Promise<ActionResult<{ deletedCount: number }>> {
  const traceId = logger.startTrace("deleteDraftAction_atomic");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Acción no autorizada." };
  }

  try {
    const validation = z.string().min(1).safeParse(draftId);
    if (!validation.success) {
      return {
        success: false,
        error: "El ID de borrador proporcionado es inválido.",
      };
    }
    const validDraftId = validation.data;

    const { count, error } = await supabase
      .from("campaign_drafts")
      .delete()
      .match({ draft_id: validDraftId, user_id: user.id });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data: { deletedCount: count ?? 0 } };
  } catch (error) {
    return {
      success: false,
      error: "No se pudo completar la eliminación en la base de datos.",
    };
  } finally {
    logger.endTrace(traceId);
  }
}
