// RUTA: src/shared/lib/actions/campaign-suite/getDraft.action.ts
/**
 * @file getDraft.action.ts
 * @description Server Action de producción para obtener el borrador más reciente de un usuario.
 * @version 1.0.0 (Atomized)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { createServerClient } from "@/shared/lib/supabase/server";
import { CampaignDraftDbSchema, type CampaignDraftDb } from "@/shared/lib/schemas/campaigns/draft.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";

export async function getDraftAction(): Promise<
  ActionResult<{ draft: CampaignDraftDb["draft_data"] | null }>
> {
  const traceId = logger.startTrace("getDraftAction_atomic");
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: true, data: { draft: null } };
  }

  try {
    const { data, error } = await supabase
      .from("campaign_drafts")
      .select("draft_id, draft_data, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(error.message);
    }

    if (data) {
        const fullDraft: CampaignDraftDb = {
            ...(data.draft_data as any),
            draft_id: data.draft_id,
            user_id: user.id,
            created_at: data.created_at,
            updated_at: data.updated_at,
        };
        const validation = CampaignDraftDbSchema.safeParse(fullDraft);

        if (!validation.success) {
            throw new Error("Datos de borrador corruptos en la base de datos.");
        }
        return { success: true, data: { draft: validation.data.draft_data } };
    } else {
        return { success: true, data: { draft: null } };
    }
  } catch (error) {
    return {
      success: false,
      error: "No se pudo obtener el borrador de la base de datos.",
    };
  } finally {
    logger.endTrace(traceId);
  }
}
