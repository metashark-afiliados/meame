// RUTA: src/shared/lib/actions/campaign-suite/saveDraft.action.ts
/**
 * @file saveDraft.action.ts
 * @description Server Action de producción para guardar/actualizar un borrador.
 * @version 1.0.0 (Atomized)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/shared/lib/supabase/server";
import {
  CampaignDraftDataSchema,
  type CampaignDraftDb,
} from "@/shared/lib/schemas/campaigns/draft.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";

export async function saveDraftAction(
  draftData: Omit<CampaignDraftDb["draft_data"], "createdAt" | "updatedAt">
): Promise<ActionResult<{ draftId: string; updatedAt: string }>> {
  const traceId = logger.startTrace("saveDraftAction_atomic");
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Acción no autorizada." };
  }

  try {
    const validation = CampaignDraftDataSchema.safeParse(draftData);
    if (!validation.success) {
      return { success: false, error: "Los datos del borrador son inválidos." };
    }

    const { error } = await supabase.from("campaign_drafts").upsert({
      draft_id: validation.data.draftId,
      user_id: user.id,
      workspace_id: 'clyd1swc3000008l3fcz262f3', // Placeholder
      draft_data: validation.data,
    });

    if (error) throw new Error(error.message);

    const now = new Date().toISOString();
    revalidatePath("/creator/campaign-suite");

    return {
      success: true,
      data: { draftId: draftData.draftId!, updatedAt: now },
    };
  } catch (error) {
    return {
      success: false,
      error: "No se pudo guardar el borrador en la base de datos.",
    };
  } finally {
    logger.endTrace(traceId);
  }
}
