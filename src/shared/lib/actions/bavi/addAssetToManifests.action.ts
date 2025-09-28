// RUTA: src/shared/lib/actions/bavi/addAssetToManifests.action.ts
/**
 * @file addAssetToManifests.action.ts
 * @description Server Action atómica para registrar un nuevo activo en Supabase,
 *              ahora consciente del contexto del workspace.
 * @version 5.0.0 (Workspace-Aware)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { createServerClient } from "@/shared/lib/supabase/server";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import type { AssetUploadMetadata } from "@/shared/lib/schemas/bavi/upload.schema";
import type { UploadApiResponse } from "cloudinary";

interface AddAssetToDbInput {
  metadata: AssetUploadMetadata;
  cloudinaryResponse: UploadApiResponse;
  userId: string;
  workspaceId: string; // <-- PARÁMETRO DE CONTEXTO REQUERIDO
}

export async function addAssetToManifestsAction({
  metadata,
  cloudinaryResponse,
  userId,
  workspaceId,
}: AddAssetToDbInput): Promise<ActionResult<{ assetId: string }>> {
  const traceId = logger.startTrace("addAssetToDb_v5.0");
  const supabase = createServerClient();

  try {
    const { error: assetError } = await supabase.from("bavi_assets").insert({
      asset_id: metadata.assetId,
      user_id: userId, // Mantenemos el creador por auditoría
      workspace_id: workspaceId, // <-- PROPIEDAD DEL WORKSPACE
      provider: "cloudinary",
      prompt_id: metadata.promptId || null,
      tags: metadata.sesaTags,
      metadata: { altText: metadata.altText },
    });

    if (assetError)
      throw new Error(
        `Error al insertar en bavi_assets: ${assetError.message}`
      );
    logger.traceEvent(
      traceId,
      `Activo ${metadata.assetId} registrado en bavi_assets.`
    );

    const { error: variantError } = await supabase
      .from("bavi_variants")
      .insert({
        variant_id: "v1-orig",
        asset_id: metadata.assetId,
        public_id: cloudinaryResponse.public_id,
        state: "orig",
        width: cloudinaryResponse.width,
        height: cloudinaryResponse.height,
      });

    if (variantError)
      throw new Error(
        `Error al insertar en bavi_variants: ${variantError.message}`
      );
    logger.traceEvent(
      traceId,
      `Variante v1-orig para ${metadata.assetId} registrada.`
    );

    logger.success(
      `[Action] Activo ${metadata.assetId} persistido con éxito en Supabase.`,
      { traceId }
    );
    return { success: true, data: { assetId: metadata.assetId } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[addAssetToManifests] Fallo al escribir en Supabase.", {
      error: errorMessage,
      traceId,
    });
    return {
      success: false,
      error: "No se pudo registrar el activo en la base de datos.",
    };
  } finally {
    logger.endTrace(traceId);
  }
}
