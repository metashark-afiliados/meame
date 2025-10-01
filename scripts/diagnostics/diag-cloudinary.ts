// RUTA: scripts/diagnostics/diag-cloudinary.ts
/**
 * @file diag-cloudinary.ts
 * @description Herramienta de diagnóstico atómica para la conexión con Cloudinary.
 * @version 2.0.0 (Elite Logging & Observability)
 *@author RaZ Podestá - MetaShark Tech
 */
import { v2 as cloudinary } from "cloudinary";
import { loadEnvironment } from "./_utils";
import { logger } from "../../src/shared/lib/logging";

async function checkCloudinary() {
  const traceId = logger.startTrace("diagCloudinaryConnection_v2.0");
  logger.startGroup("🖼️  Iniciando Diagnóstico de Conexión a Cloudinary...");

  try {
    loadEnvironment([
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ]);
    logger.traceEvent(traceId, "Variables de entorno cargadas.");

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    logger.info(
      `Conectando al Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`,
      { traceId }
    );

    const result = await cloudinary.api.ping();
    if (result?.status !== "ok") {
      throw new Error(
        `La respuesta del ping no fue 'ok', fue '${result?.status}'.`
      );
    }
    logger.success(
      "Conexión con Cloudinary exitosa. Las credenciales son válidas.",
      { traceId }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("❌ [FALLO] No se pudo autenticar con la API de Cloudinary.", {
      error: errorMessage,
      traceId,
    });
    logger.info(
      "Verifica que tus CLOUDINARY_CLOUD_NAME, API_KEY, y API_SECRET sean correctos."
    );
    process.exit(1);
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}

checkCloudinary();
