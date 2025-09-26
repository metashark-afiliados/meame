// RUTA: src/shared/lib/actions/raz-prompts/linkPromptToBaviAsset.action.ts
/**
 * @file linkPromptToBaviAsset.action.ts
 * @description Server Action simbiótica de producción para vincular un activo de la BAVI a un genoma de prompt.
 * @version 5.0.0 (Production-Ready User Context)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { connectToDatabase } from "@/shared/lib/mongodb";
import { createServerClient } from "@/shared/lib/supabase/server"; // <-- IMPORTACIÓN CLAVE
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
  const traceId = logger.startTrace("linkPromptToBaviAsset_v5.0");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- GUARDIA DE SEGURIDAD SOBERANA ---
  if (!user) {
    logger.warn("[Action] Intento no autorizado de vincular prompt.", {
      traceId,
    });
    return { success: false, error: "auth_required" };
  }

  try {
    if (!promptId || !baviAssetId || !baviVariantId) {
      return { success: false, error: "Faltan IDs para la vinculación." };
    }

    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection<RaZPromptsEntry>("prompts");

    // --- LÓGICA DE PRODUCCIÓN ---
    // La consulta es segura y contextual. Solo actualiza si el promptId y el userId coinciden.
    const result = await collection.updateOne(
      { promptId: promptId, userId: user.id },
      {
        $set: {
          status: "generated",
          updatedAt: new Date().toISOString(),
          baviAssetId: baviAssetId, // Mantenemos por retrocompatibilidad temporal
          baviVariantId: baviVariantId,
          imageUrl: imageUrl,
        },
        $addToSet: {
          // Usamos $addToSet para evitar duplicados en el array
          baviAssetIds: baviAssetId,
        },
      }
    );

    if (result.matchedCount === 0) {
      throw new Error(
        `No se encontró un prompt con ID: ${promptId} perteneciente al usuario actual.`
      );
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
      traceId,
    });
    return {
      success: false,
      error: "No se pudo vincular el prompt al activo.",
    };
  }
}
