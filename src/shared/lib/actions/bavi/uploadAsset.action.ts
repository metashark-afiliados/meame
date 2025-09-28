// RUTA: src/shared/lib/actions/bavi/uploadAsset.action.ts
/**
 * @file uploadAsset.action.ts
 * @description Server Action orquestadora de élite para la ingesta completa
 *              de activos, ahora consciente del contexto del workspace.
 * @version 10.0.0 (Workspace-Aware Orchestration & Security)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { createServerClient } from "@/shared/lib/supabase/server";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { assetUploadMetadataSchema } from "@/shared/lib/schemas/bavi/upload.schema";
import { addAssetToManifestsAction } from "./addAssetToManifests.action";
import { linkPromptToBaviAssetAction } from "@/shared/lib/actions/raz-prompts";

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error(
    "Las variables de entorno de Cloudinary no están configuradas."
  );
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadAssetAction(
  formData: FormData
): Promise<ActionResult<UploadApiResponse>> {
  const traceId = logger.startTrace("uploadAssetOrchestration_v10.0");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logger.warn("[Action] Intento no autorizado de subir activo.", { traceId });
    return { success: false, error: "auth_required" };
  }

  try {
    const file = formData.get("file");
    const metadataString = formData.get("metadata") as string;
    const workspaceId = formData.get("workspaceId") as string;

    if (!file || !(file instanceof File) || !metadataString || !workspaceId) {
      throw new Error("Datos de subida incompletos o falta el workspaceId.");
    }

    // --- GUARDIA DE SEGURIDAD DE WORKSPACE ---
    const { data: memberCheck, error: memberError } = await supabase.rpc(
      "is_workspace_member",
      { workspace_id_to_check: workspaceId }
    );

    if (memberError || !memberCheck) {
      logger.error("[Action] Verificación de membresía fallida.", {
        userId: user.id,
        workspaceId,
        error: memberError,
        traceId,
      });
      throw new Error("Acceso denegado al workspace.");
    }
    logger.traceEvent(
      traceId,
      `Usuario ${user.id} verificado como miembro del workspace ${workspaceId}.`
    );
    // --- FIN DE LA GUARDIA DE SEGURIDAD ---

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
              folder: `webvork/assets/${workspaceId}/${metadata.assetId}`,
              public_id: "v1-original",
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

    const manifestResult = await addAssetToManifestsAction({
      metadata,
      cloudinaryResponse,
      userId: user.id,
      workspaceId: workspaceId,
    });

    if (!manifestResult.success) {
      return manifestResult;
    }

    if (metadata.promptId) {
      const linkResult = await linkPromptToBaviAssetAction({
        promptId: metadata.promptId,
        baviAssetId: metadata.assetId,
        baviVariantId: "v1-orig",
        imageUrl: cloudinaryResponse.secure_url,
        workspaceId: workspaceId,
      });
      if (!linkResult.success) return linkResult;
    }

    logger.success("[Action] Orquestación de ingesta completada con éxito.", {
      traceId,
    });
    return { success: true, data: cloudinaryResponse };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[Action] Fallo en la orquestación de ingesta de activo.", {
      error: errorMessage,
      traceId,
    });
    return {
      success: false,
      error: "Fallo el proceso de ingesta del activo.",
    };
  } finally {
    logger.endTrace(traceId);
  }
}
