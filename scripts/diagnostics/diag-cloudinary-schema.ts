// scripts/diagnostics/diag-cloudinary-schema.ts
/**
 * @file diag-cloudinary-schema.ts
 * @description Herramienta de auditoría para inspeccionar la configuración de Cloudinary.
 * @version 9.0.0 (Centralized Reporting & Elite Observability)
 * @author L.I.A. Legacy
 */
import { v2 as cloudinary } from "cloudinary";
import * as fs from "fs/promises";
import * as path from "path";
import { loadEnvironment } from "./_utils";
import { logger } from "../../src/shared/lib/logging";
import type { ActionResult } from "../../src/shared/lib/types/actions.types";

interface MetadataField {
  label: string;
  external_id: string;
  type: string;
}

interface CorrectMetadataFieldsApiResponse {
  fields: MetadataField[];
}

async function diagnoseCloudinarySchema(): Promise<ActionResult<string>> {
  const traceId = logger.startTrace("diagnoseCloudinarySchema_v9.0");
  logger.startGroup("🔬 Auditando configuración de Cloudinary...");

  try {
    loadEnvironment([
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ]);

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    logger.info(`Auditando cloud: '${process.env.CLOUDINARY_CLOUD_NAME}'`, {
      traceId,
    });

    const [presets, transformations, tags, metadataFieldsResponse] =
      await Promise.all([
        cloudinary.api.upload_presets(),
        cloudinary.api.transformations(),
        cloudinary.api.tags(),
        cloudinary.api.list_metadata_fields() as unknown as Promise<CorrectMetadataFieldsApiResponse>,
      ]);
    logger.traceEvent(traceId, "Datos de esquema obtenidos de la API.");

    const fullReport = {
      upload_presets: presets.presets,
      transformations: transformations.transformations,
      tags: tags.tags,
      metadata_fields: metadataFieldsResponse.fields || [],
    };

    const reportDir = path.resolve(process.cwd(), "reports", "cloudinary");
    await fs.mkdir(reportDir, { recursive: true });
    const reportPath = path.resolve(
      reportDir,
      `latest-schema-diagnostics.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(fullReport, null, 2));

    const successMessage = `Reporte de esquema JSON guardado en: ${path.relative(process.cwd(), reportPath)}`;
    logger.success(successMessage, { traceId });
    return { success: true, data: successMessage };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("🔥 Fallo al auditar el esquema de Cloudinary:", {
      error: errorMessage,
      traceId,
    });
    return { success: false, error: errorMessage };
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}

export default diagnoseCloudinarySchema;
