// RUTA: src/shared/lib/actions/bavi/uploadAsset.action.ts
/**
 * @file uploadAsset.action.ts
 * @description Server Action orquestadora para la ingesta completa de activos,
 *              ahora instrumentada con tracing de élite y contrato de API corregido.
 * @version 6.1.0 (API Contract Fix)
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
  const traceId = logger.startTrace("uploadAssetOrchestration_v6.1");
  try {
    const file = formData.get("file") as File;
    const metadataString = formData.get("metadata") as string;

    if (!file || !metadataString) {
      return { success: false, error: "Datos de subida incompletos." };
    }

    const metadata = assetUploadMetadataSchema.parse(
      JSON.parse(metadataString)
    );
    logger.traceEvent(traceId, "Metadatos parseados y validados.");

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
      logger.traceEvent(traceId, "Iniciando vinculación con RaZPrompts...");
      // --- [INICIO DE CORRECCIÓN DE CONTRATO] ---
      // La llamada ahora incluye baviVariantId, cumpliendo el nuevo contrato.
      const linkResult = await linkPromptToBaviAssetAction({
        promptId: metadata.promptId,
        baviAssetId: metadata.assetId,
        baviVariantId: "v1-orig", // Asumimos la primera versión como la canónica
        imageUrl: cloudinaryResponse.secure_url,
      });
      // --- [FIN DE CORRECCIÓN DE CONTRATO] ---
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
      traceId,
    });
    logger.endTrace(traceId, { error: errorMessage });
    return {
      success: false,
      error: "Fallo el proceso de ingesta del activo.",
    };
  }
}
