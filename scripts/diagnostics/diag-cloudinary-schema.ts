// RUTA: scripts/diagnostics/diag-cloudinary-schema.ts
/**
 * @file diag-cloudinary-schema.ts
 * @description Herramienta de auditoría para inspeccionar la configuración y "esquema" de Cloudinary.
 * @version 8.0.0 (Holistic Integrity Restoration)
 * @author L.I.A. Legacy
 */
import { v2 as cloudinary } from "cloudinary";
import * as fs from "fs/promises";
import * as path from "path";
import { loadEnvironment } from "./_utils";
import { logger } from "../../src/shared/lib/logging";
import type { ActionResult } from "../../src/shared/lib/types/actions.types";

// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: CONTRATOS DE TIPO SOBERANOS] ---
interface UploadPreset {
  name: string;
  settings: {
    folder?: string;
  };
}

interface Transformation {
  name: string;
  used: boolean;
}

interface MetadataField {
  label: string;
  external_id: string;
  type: string;
}

interface CorrectMetadataFieldsApiResponse {
  fields: MetadataField[];
}
// --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

async function diagnoseCloudinarySchema(): Promise<ActionResult<string>> {
  const traceId = logger.startTrace("diagnoseCloudinarySchema_v8.0");
  logger.startGroup("🔬 Auditando configuración de Cloudinary (v8.0)...");

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

    const fullReport: Record<string, unknown> = {};

    const [presets, transformations, tags, metadataFieldsResponse] =
      await Promise.all([
        cloudinary.api.upload_presets(),
        cloudinary.api.transformations(),
        cloudinary.api.tags(),
        cloudinary.api.list_metadata_fields() as unknown as Promise<CorrectMetadataFieldsApiResponse>,
      ]);
    logger.traceEvent(traceId, "Datos de esquema obtenidos de la API.");

    // --- [INICIO DE RESTAURACIÓN DE LÓGICA] ---
    const metadataFields: MetadataField[] = metadataFieldsResponse.fields || [];

    fullReport.upload_presets = presets.presets;
    fullReport.transformations = transformations.transformations;
    fullReport.tags = tags.tags;
    fullReport.metadata_fields = metadataFields;

    logger.info("--- PRESETS DE SUBIDA ---", {
      data: presets.presets.map((p: UploadPreset) => ({
        Nombre: p.name,
        Opciones: `${p.settings.folder ? `Carpeta: ${p.settings.folder}` : ""}`,
      })),
    });

    logger.info("--- TRANSFORMACIONES GUARDADAS ---", {
      data: transformations.transformations.map((t: Transformation) => ({
        Nombre: t.name,
        Usada: t.used,
      })),
    });

    logger.info("--- ETIQUETAS (TAGS) EN USO ---", { tags: tags.tags.join(", ") });

    if (metadataFields.length > 0) {
      logger.info("--- CAMPOS DE METADATOS ESTRUCTURADOS ---", {
        data: metadataFields.map((f: MetadataField) => ({
          Label: f.label,
          External_ID: f.external_id,
          Tipo: f.type,
        })),
      });
    } else {
        logger.info("--- CAMPOS DE METADATOS ESTRUCTURADOS ---", { data: "No se encontraron campos de metadatos definidos."});
    }
    // --- [FIN DE RESTAURACIÓN DE LÓGICA] ---

    const reportDir = path.resolve(process.cwd(), "cloudinary/reports");
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
