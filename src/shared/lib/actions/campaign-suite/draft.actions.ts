// RUTA: src/shared/lib/actions/campaign-suite/draft.actions.ts
/**
 * @file draft.actions.ts
 * @description Server Actions de producción para el ciclo de vida de los borradores de campaña,
 *              operando soberanamente sobre Supabase.
 * @version 6.2.0 (Type-Safe & Linter-Compliant)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/shared/lib/supabase/server";
import {
  CampaignDraftDataSchema,
  CampaignDraftDbSchema, // <-- IMPORTACIÓN CORREGIDA
  type CampaignDraftDb,
} from "@/shared/lib/schemas/campaigns/draft.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";
import { z } from "zod";

export async function saveDraftAction(
  draftData: Omit<CampaignDraftDb, "createdAt" | "updatedAt" | "userId">
): Promise<ActionResult<{ draftId: string; updatedAt: string }>> {
  const traceId = logger.startTrace("saveDraftAction_v6.2_supabase");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logger.warn("[Action] Intento no autorizado de guardar borrador.", {
      traceId,
    });
    return { success: false, error: "Acción no autorizada." };
  }

  logger.info(
    `[Action] Guardando borrador en Supabase para usuario: ${user.id}`,
    {
      traceId,
      draftId: draftData.draftId,
    }
  );

  try {
    const validation = CampaignDraftDataSchema.safeParse(draftData);
    if (!validation.success) {
      logger.error("[saveDraftAction] Fallo de validación de Zod.", {
        error: validation.error.flatten(),
        traceId,
      });
      return { success: false, error: "Los datos del borrador son inválidos." };
    }

    const { error } = await supabase.from("campaign_drafts").upsert({
      draft_id: validation.data.draftId,
      user_id: user.id,
      draft_data: validation.data, // <-- 'as any' ELIMINADO
    });

    if (error) {
      logger.error(
        "[saveDraftAction] Error desde Supabase al guardar el borrador.",
        {
          error: error.message,
          traceId,
        }
      );
      throw new Error(error.message);
    }

    const now = new Date().toISOString();

    revalidatePath("/creator/campaign-suite");
    logger.success(
      `[Action] Borrador ${draftData.draftId} sincronizado con Supabase.`,
      { traceId }
    );

    return {
      success: true,
      data: { draftId: draftData.draftId, updatedAt: now },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "[saveDraftAction] Fallo al guardar el borrador en Supabase.",
      {
        error: errorMessage,
        traceId,
      }
    );
    return {
      success: false,
      error: "No se pudo guardar el borrador en la base de datos.",
    };
  } finally {
    logger.endTrace(traceId);
  }
}

export async function getDraftAction(): Promise<
  ActionResult<{ draft: CampaignDraftDb | null }>
> {
  const traceId = logger.startTrace("getDraftAction_v6.2_supabase");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logger.info(
      "[Action] No hay usuario autenticado. No se puede cargar el borrador.",
      { traceId }
    );
    return { success: true, data: { draft: null } };
  }

  logger.info(
    `[Action] Obteniendo último borrador de Supabase para usuario: ${user.id}`,
    {
      traceId,
    }
  );

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
        ...(data.draft_data as Omit<
          CampaignDraftDb,
          "draftId" | "createdAt" | "updatedAt" | "userId"
        >),
        draftId: data.draft_id,
        userId: user.id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      // --- VALIDACIÓN DE LECTURA ---
      const validation = CampaignDraftDbSchema.safeParse(fullDraft); // <-- VALIDACIÓN CORREGIDA
      if (!validation.success) {
        logger.error("[getDraftAction] El borrador de la DB es inválido.", {
          error: validation.error.flatten(),
          traceId,
        });
        throw new Error("Datos de borrador corruptos en la base de datos.");
      }

      logger.success(
        `[Action] Borrador ${validation.data.draftId} encontrado y validado.`,
        { traceId }
      );
      return { success: true, data: { draft: validation.data } };
    } else {
      logger.info(
        "[Action] El usuario no tiene borradores guardados en Supabase.",
        {
          traceId,
        }
      );
      return { success: true, data: { draft: null } };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[getDraftAction] Fallo al obtener el borrador de Supabase.", {
      error: errorMessage,
      traceId,
    });
    return {
      success: false,
      error: "No se pudo obtener el borrador de la base de datos.",
    };
  } finally {
    logger.endTrace(traceId);
  }
}

export async function deleteDraftAction(
  draftId: string
): Promise<ActionResult<{ deletedCount: number }>> {
  const traceId = logger.startTrace("deleteDraftAction_v3.0_supabase");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logger.warn("[Action] Intento no autorizado de eliminar borrador.", {
      traceId,
    });
    return { success: false, error: "Acción no autorizada." };
  }

  logger.warn(
    `[Action] Petición para eliminar borrador de Supabase: ${draftId}`,
    {
      traceId,
      userId: user.id,
    }
  );

  try {
    const validation = z.string().min(1).safeParse(draftId);
    if (!validation.success) {
      const errorMsg = "El ID de borrador proporcionado es inválido.";
      logger.error(`[Action] ${errorMsg}`, {
        errors: validation.error.flatten(),
        receivedId: draftId,
        traceId,
      });
      return { success: false, error: errorMsg };
    }
    const validDraftId = validation.data;

    const { count, error } = await supabase
      .from("campaign_drafts")
      .delete()
      .match({ draft_id: validDraftId, user_id: user.id });

    if (error) {
      throw new Error(error.message);
    }

    if (count !== null && count > 0) {
      logger.success(
        `[Action] Borrador ${validDraftId} eliminado exitosamente de Supabase.`,
        { traceId, deletedCount: count }
      );
    } else {
      logger.warn(
        "[Action] No se encontró ningún borrador para eliminar que coincida con los criterios.",
        { draftId: validDraftId, userId: user.id, traceId }
      );
    }

    return { success: true, data: { deletedCount: count ?? 0 } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "[Action] Fallo crítico al intentar eliminar el borrador de Supabase.",
      {
        error: errorMessage,
        traceId,
      }
    );
    return {
      success: false,
      error: "No se pudo completar la eliminación en la base de datos.",
    };
  } finally {
    logger.endTrace(traceId);
  }
}
