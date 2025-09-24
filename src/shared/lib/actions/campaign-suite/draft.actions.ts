// app/[locale]/(dev)/dev/campaign-suite/_actions/draft.actions.ts
/**
 * @file draft.actions.ts
 * @description Server Actions para el ciclo de vida de los borradores de campaña en MongoDB.
 * @version 3.0.0 (FSD Architecture Alignment)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/shared/lib/mongodb";
import {
  CampaignDraftDataSchema,
  type CampaignDraftDb,
} from "@/shared/lib/schemas/campaigns/draft.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";

const MOCK_USER_ID = "user__metashark_dev";

async function getDraftsCollection() {
  const client = await connectToDatabase();
  const db = client.db(process.env.MONGODB_DB_NAME);
  return db.collection<CampaignDraftDb>("campaign_drafts");
}

export async function saveDraftAction(
  draftData: Omit<CampaignDraftDb, "createdAt" | "updatedAt" | "userId">
): Promise<ActionResult<{ draftId: string; updatedAt: string }>> {
  try {
    const collection = await getDraftsCollection();
    const now = new Date().toISOString();

    const validation = CampaignDraftDataSchema.safeParse(draftData);
    if (!validation.success) {
      logger.error("[saveDraftAction] Fallo de validación de Zod.", {
        error: validation.error.flatten(),
      });
      return { success: false, error: "Los datos del borrador son inválidos." };
    }

    const result = await collection.updateOne(
      { draftId: draftData.draftId, userId: MOCK_USER_ID },
      {
        $set: {
          ...validation.data,
          updatedAt: now,
          userId: MOCK_USER_ID,
        },
        $setOnInsert: {
          createdAt: now,
          draftId: draftData.draftId,
        },
      },
      { upsert: true }
    );

    if (result.modifiedCount === 0 && result.upsertedCount === 0) {
      throw new Error("La operación de guardado no modificó ningún documento.");
    }

    revalidatePath("/dev/campaign-suite/create");
    return {
      success: true,
      data: { draftId: draftData.draftId, updatedAt: now },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[saveDraftAction] Fallo al guardar el borrador.", {
      error: errorMessage,
    });
    return {
      success: false,
      error: "No se pudo guardar el borrador en la base de datos.",
    };
  }
}

export async function getDraftAction(): Promise<
  ActionResult<{ draft: CampaignDraftDb | null }>
> {
  try {
    const collection = await getDraftsCollection();
    const draft = await collection.findOne(
      { userId: MOCK_USER_ID },
      { sort: { updatedAt: -1 } }
    );
    return { success: true, data: { draft } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[getDraftAction] Fallo al obtener el borrador.", {
      error: errorMessage,
    });
    return {
      success: false,
      error: "No se pudo obtener el borrador de la base de datos.",
    };
  }
}
// app/[locale]/(dev)/dev/campaign-suite/_actions/draft.actions.ts
