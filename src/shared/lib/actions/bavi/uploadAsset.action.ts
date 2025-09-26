// RUTA: src/shared/lib/actions/bavi/uploadAsset.action.ts
/**
 * @file uploadAsset.action.ts
 * @description Server Action orquestadora de élite para la ingesta completa
 *              de activos a producción. Gestiona la autenticación, la subida
 *              segura a Cloudinary y la persistencia de metadatos en la base de datos.
 * @version 8.0.0 (Production-Grade Resilience & Observability)
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

// Configuración del SDK de Cloudinary. Falla rápido si las variables no están.
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
  const traceId = logger.startTrace("uploadAssetOrchestration_v8.0");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- 1. Guardia de Resiliencia: Autenticación ---
  if (!user) {
    logger.warn("[Action] Intento no autorizado de subir activo.", { traceId });
    logger.endTrace(traceId, { status: "Unauthorized" });
    return { success: false, error: "auth_required" };
  }

  logger.info(`[Action] Iniciando ingesta de activo para usuario: ${user.id}`, {
    traceId,
  });

  try {
    // --- 2. Guardia de Resiliencia: Integridad del Payload ---
    const file = formData.get("file");
    const metadataString = formData.get("metadata") as string;

    if (!file || !(file instanceof File) || !metadataString) {
      throw new Error("Datos de subida incompletos o malformados.");
    }

    // --- 3. Guardia de Resiliencia: Contrato de Datos (Zod) ---
    const metadata = assetUploadMetadataSchema.parse(
      JSON.parse(metadataString)
    );
    logger.traceEvent(traceId, "Metadatos parseados y validados con Zod.");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // --- 4. Lógica de Negocio: Subida a Proveedor Externo ---
    const cloudinaryResponse = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              // Lógica de Producción: Ruta contextual con "Sello del Forjador"
              folder: `webvork/assets/${user.id}/${metadata.assetId}`,
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

    // --- 5. Lógica de Negocio: Orquestación de Persistencia ---
    const manifestResult = await addAssetToManifestsAction({
      metadata,
      cloudinaryResponse,
      userId: user.id, // Se pasa el ID del propietario
    });

    if (!manifestResult.success) {
      // Propaga el error del "notario" al orquestador.
      return manifestResult;
    }
    logger.traceEvent(traceId, "Metadatos persistidos en Supabase (BAVI).");

    // --- 6. Lógica de Negocio: Vinculación Simbiótica Condicional ---
    if (metadata.promptId) {
      logger.traceEvent(traceId, "Iniciando vinculación con RaZPrompts...");
      const linkResult = await linkPromptToBaviAssetAction({
        promptId: metadata.promptId,
        baviAssetId: metadata.assetId,
        baviVariantId: "v1-orig",
        imageUrl: cloudinaryResponse.secure_url,
      });
      if (!linkResult.success) return linkResult;
      logger.traceEvent(traceId, "Vínculo con RaZPrompts completado.");
    }

    logger.success("[Action] Orquestación de ingesta completada con éxito.", {
      traceId,
    });
    return { success: true, data: cloudinaryResponse };
  } catch (error) {
    // --- 7. Guardia de Resiliencia: Manejo de Errores Centralizado ---
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
    // --- Observabilidad: Cierre de Trace ---
    logger.endTrace(traceId);
  }
}
