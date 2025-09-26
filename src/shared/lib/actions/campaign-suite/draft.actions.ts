// RUTA: src/shared/lib/actions/campaign-suite/draft.actions.ts
/**
 * @file draft.actions.ts
 * @description Server Actions de producción para el ciclo de vida de los borradores de campaña.
 * @version 4.0.0 (Production-Ready User Context & FSD Alignment)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { createServerClient } from "@/shared/lib/supabase/server"; // <-- IMPORTACIÓN CLAVE
import {
  CampaignDraftDataSchema,
  type CampaignDraftDb,
} from "@/shared/lib/schemas/campaigns/draft.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";

/**
 * @function getDraftsCollection
 * @description Helper puro para obtener la colección de borradores de MongoDB.
 * @private
 */
async function getDraftsCollection() {
  const client = await connectToDatabase();
  const db = client.db(process.env.MONGODB_DB_NAME);
  return db.collection<CampaignDraftDb>("campaign_drafts");
}

export async function saveDraftAction(
  draftData: Omit<CampaignDraftDb, "createdAt" | "updatedAt" | "userId">
): Promise<ActionResult<{ draftId: string; updatedAt: string }>> {
  const traceId = logger.startTrace("saveDraftAction_v4.0");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- GUARDIA DE SEGURIDAD SOBERANA ---
  if (!user) {
    logger.warn("[Action] Intento no autorizado de guardar borrador.", {
      traceId,
    });
    return { success: false, error: "Acción no autorizada." };
  }

  logger.info(`[Action] Guardando borrador para usuario: ${user.id}`, {
    traceId,
  });

  try {
    const collection = await getDraftsCollection();
    const now = new Date().toISOString();

    const validation = CampaignDraftDataSchema.safeParse(draftData);
    if (!validation.success) {
      logger.error("[saveDraftAction] Fallo de validación de Zod.", {
        error: validation.error.flatten(),
        traceId,
      });
      return { success: false, error: "Los datos del borrador son inválidos." };
    }

    // --- LÓGICA DE PRODUCCIÓN ---
    // La consulta es segura y contextual: solo puede actualizar (upsert) un
    // borrador que pertenezca al usuario actual.
    const result = await collection.updateOne(
      { draftId: draftData.draftId, userId: user.id },
      {
        $set: {
          ...validation.data,
          updatedAt: now,
          userId: user.id, // Se asegura de que el userId esté siempre presente
        },
        $setOnInsert: {
          createdAt: now,
          draftId: draftData.draftId,
        },
      },
      { upsert: true }
    );

    if (result.modifiedCount === 0 && result.upsertedCount === 0) {
      // Este caso podría ocurrir si hay un problema de concurrencia, es una
      // buena práctica registrarlo.
      logger.warn(
        "[saveDraftAction] La operación de guardado no modificó ningún documento.",
        { traceId }
      );
    }

    revalidatePath("/creator/campaign-suite"); // Revalida la página de la SDC
    logger.success(
      `[Action] Borrador ${draftData.draftId} sincronizado con la DB.`,
      { traceId }
    );

    return {
      success: true,
      data: { draftId: draftData.draftId, updatedAt: now },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[saveDraftAction] Fallo al guardar el borrador.", {
      error: errorMessage,
      traceId,
    });
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
  const traceId = logger.startTrace("getDraftAction_v4.0");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- GUARDIA DE SEGURIDAD SOBERANA ---
  if (!user) {
    logger.info(
      "[Action] No hay usuario autenticado. No se puede cargar el borrador.",
      { traceId }
    );
    // No es un error, simplemente no hay borrador para un usuario no logueado.
    return { success: true, data: { draft: null } };
  }

  logger.info(`[Action] Obteniendo último borrador para usuario: ${user.id}`, {
    traceId,
  });

  try {
    const collection = await getDraftsCollection();

    // --- LÓGICA DE PRODUCCIÓN ---
    // La consulta es segura y contextual: solo busca borradores del usuario actual.
    const draft = await collection.findOne(
      { userId: user.id },
      { sort: { updatedAt: -1 } } // Obtiene el más reciente
    );

    if (draft) {
      logger.success(
        `[Action] Borrador ${draft.draftId} encontrado para el usuario.`,
        { traceId }
      );
    } else {
      logger.info("[Action] El usuario no tiene borradores guardados.", {
        traceId,
      });
    }

    return { success: true, data: { draft } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[getDraftAction] Fallo al obtener el borrador.", {
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
