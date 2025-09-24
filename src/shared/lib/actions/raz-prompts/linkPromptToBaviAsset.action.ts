// app/[locale]/(dev)/raz-prompts/_actions/linkPromptToBaviAsset.action.ts
/**
 * @file linkPromptToBaviAsset.action.ts
 * @description Server Action para vincular un prompt existente a un activo de la BAVI.
 * @version 3.0.0 (FSD Architecture Alignment)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { connectToDatabase } from "@/shared/lib/mongodb";
import type { RaZPromptsEntry } from "@/shared/lib/schemas/raz-prompts/entry.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";

interface LinkPromptInput {
  promptId: string;
  baviAssetId: string;
  baviVariantId: string;
  imageUrl?: string;
}

export async function linkPromptToBaviAssetAction({
  promptId,
  baviAssetId,
  baviVariantId,
  imageUrl,
}: LinkPromptInput): Promise<ActionResult<{ updatedCount: number }>> {
  const traceId = logger.startTrace("linkPromptToBaviAsset");
  try {
    if (!promptId || !baviAssetId || !baviVariantId) {
      return { success: false, error: "Faltan IDs para la vinculación." };
    }

    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection<RaZPromptsEntry>("prompts");

    const updateDoc: Partial<RaZPromptsEntry> = {
      status: "generated",
      baviAssetId: baviAssetId,
      baviVariantId: baviVariantId,
      updatedAt: new Date().toISOString(),
    };

    if (imageUrl) {
      updateDoc.imageUrl = imageUrl;
    }

    const result = await collection.updateOne(
      { promptId: promptId },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      throw new Error(`No se encontró ningún prompt con el ID: ${promptId}`);
    }

    logger.success(
      `[linkPromptToBaviAsset] Prompt ${promptId} vinculado con éxito al activo BAVI ${baviAssetId}.`
    );
    logger.endTrace(traceId);
    return { success: true, data: { updatedCount: result.modifiedCount } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[linkPromptToBaviAsset] Fallo crítico en la acción.", {
      error: errorMessage,
    });
    logger.endTrace(traceId);
    return {
      success: false,
      error: "No se pudo vincular el prompt al activo.",
    };
  }
}
// app/[locale]/(dev)/raz-prompts/_actions/linkPromptToBaviAsset.action.ts
