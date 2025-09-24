// Ruta correcta: src/shared/lib/actions/bavi/uploadAsset.action.ts
/**
 * @file uploadAsset.action.ts
 * @description Server Action orquestadora para la ingesta completa de activos.
 * @version 5.1.0 (Sovereign Path Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { assetUploadMetadataSchema } from "@/shared/lib/schemas/bavi/upload.schema";
import { addAssetToManifestsAction } from "./addAssetToManifests.action";
import { linkPromptToBaviAssetAction } from "@/shared/lib/actions/raz-prompts";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadAssetAction(
  formData: FormData
): Promise<ActionResult<UploadApiResponse>> {
  const traceId = logger.startTrace("uploadAssetOrchestration");
  try {
    const file = formData.get("file") as File;
    const metadataString = formData.get("metadata") as string;

    if (!file || !metadataString)
      return { success: false, error: "Datos incompletos." };

    const metadata = assetUploadMetadataSchema.parse(
      JSON.parse(metadataString)
    );

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const cloudinaryResponse = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              public_id: metadata.assetId,
              folder: `webvork/assets/${metadata.assetId}/v1-original`,
              resource_type: "auto",
            },
            (error, result) => {
              if (error) return reject(error);
              if (result) return resolve(result);
              reject(new Error("Respuesta de Cloudinary indefinida."));
            }
          )
          .end(buffer);
      }
    );
    logger.traceEvent(traceId, "Subida a Cloudinary exitosa.");

    const manifestResult = await addAssetToManifestsAction(
      metadata,
      cloudinaryResponse
    );
    if (!manifestResult.success) return manifestResult;
    logger.traceEvent(traceId, "Manifiestos de BAVI actualizados.");

    if (metadata.promptId) {
      const linkResult = await linkPromptToBaviAssetAction({
        promptId: metadata.promptId,
        baviAssetId: metadata.assetId,
        baviVariantId: "v1-orig",
        imageUrl: cloudinaryResponse.secure_url,
      });
      if (!linkResult.success) return linkResult;
      logger.traceEvent(traceId, "Vínculo con RaZPrompts completado.");
    }

    logger.endTrace(traceId);
    return { success: true, data: cloudinaryResponse };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[uploadAssetAction] Fallo en la orquestación.", {
      error: errorMessage,
    });
    logger.endTrace(traceId);
    return { success: false, error: "Fallo el proceso de ingesta del activo." };
  }
}
// Ruta correcta: src/shared/lib/actions/bavi/uploadAsset.action.ts
