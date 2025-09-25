// RUTA: src/shared/lib/actions/raz-prompts/linkPromptToBaviAsset.action.ts
/**
 * @file linkPromptToBaviAsset.action.ts
 * @description Server Action simbiótica para vincular un activo de la BAVI a un genoma de prompt.
 * @version 4.1.0 (Variant ID Linkage)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { connectToDatabase } from "@/shared/lib/mongodb";
import type { RaZPromptsEntry } from "@/shared/lib/schemas/raz-prompts/entry.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";
import { createServerClient } from "@/shared/lib/supabase/server";

// --- [INICIO DE REFACTORIZACIÓN DE CONTRATO] ---
interface LinkPromptInput {
  promptId: string;
  baviAssetId: string;
  baviVariantId: string; // <-- La propiedad ahora es parte del contrato.
  imageUrl?: string; // Se mantiene como opcional.
}
// --- [FIN DE REFACTORIZACIÓN DE CONTRATO] ---

export async function linkPromptToBaviAssetAction({
  promptId,
  baviAssetId,
  baviVariantId, // <-- Se consume la nueva propiedad.
  imageUrl,
}: LinkPromptInput): Promise<ActionResult<{ updatedCount: number }>> {
  const traceId = logger.startTrace("linkPromptToBaviAsset_v4.1");
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "auth_required" };
    }

    if (!promptId || !baviAssetId || !baviVariantId) {
      return { success: false, error: "Faltan IDs para la vinculación." };
    }

    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection<RaZPromptsEntry>("prompts");

    const result = await collection.updateOne(
      { promptId: promptId, userId: user.id },
      {
        $set: {
          status: "generated",
          updatedAt: new Date().toISOString(),
          // --- [INICIO DE REFACTORIZACIÓN DE LÓGICA] ---
          // Se actualizan ambos campos de BAVI.
          baviAssetId: baviAssetId,
          baviVariantId: baviVariantId,
          imageUrl: imageUrl, // Se persiste la URL de la imagen si se proporciona
          // --- [FIN DE REFACTORIZACIÓN DE LÓGICA] ---
        },
      }
    );

    if (result.matchedCount === 0) {
      throw new Error(
        `No se encontró un prompt con ID: ${promptId} perteneciente al usuario actual.`
      );
    }

    logger.success(
      `[linkPromptToBaviAsset] Prompt ${promptId} vinculado con éxito al activo BAVI ${baviAssetId} (variante: ${baviVariantId}).`
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
