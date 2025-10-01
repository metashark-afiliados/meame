// RUTA: scripts/diagnostics/diag-cloudinary-content.ts
/**
 * @file diag-cloudinary-content.ts
 * @description Herramienta de auditoría para realizar un censo de contenido en Cloudinary.
 * @version 4.0.0 (Orchestrator-Compliant & Resilient)
 *@author RaZ Podestá - MetaShark Tech
 */
import { v2 as cloudinary } from "cloudinary";
import * as fs from "fs/promises";
import * as path from "path";
import { loadEnvironment } from "./_utils";
import { logger } from "../../src/shared/lib/logging";
import type { ActionResult } from "../../src/shared/lib/types/actions.types";

interface Resource {
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  uploaded_at: string;
}

async function diagnoseCloudinaryContent(): Promise<ActionResult<string>> {
  const traceId = logger.startTrace("diagnoseCloudinaryContent_v4.0");
  logger.startGroup("📊 Realizando censo de contenido en Cloudinary (v4.0)...");

  try {
    loadEnvironment([
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ]);
    logger.traceEvent(traceId, "Variables de entorno validadas.");

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    logger.info(`Censando cloud: '${process.env.CLOUDINARY_CLOUD_NAME}'`, {
      traceId,
    });

    const fullReport: Record<string, unknown> = {};

    const [usage, resources] = await Promise.all([
      cloudinary.api.usage(),
      cloudinary.search
        .expression("resource_type:image")
        .sort_by("uploaded_at", "desc")
        .max_results(10)
        .execute(),
    ]);
    logger.traceEvent(traceId, "Datos de contenido obtenidos de la API.");

    // --- [INICIO DE RESTAURACIÓN DE LÓGICA] ---
    fullReport.usage_summary = usage;
    fullReport.recent_assets = resources.resources;

    const usageSummary = {
      Plan: usage.plan,
      "Almacenamiento (GB)": (usage.storage.usage / 1e9).toFixed(3),
      Transformaciones: usage.transformations.usage,
      "Ancho de Banda (GB)": (usage.bandwidth.usage / 1e9).toFixed(3),
      "Total de Activos": resources.total_count,
    };
    logger.info("--- RESUMEN DE USO ---", { data: usageSummary });

    if (resources.resources.length > 0) {
      const recentAssets = resources.resources.map((r: Resource) => ({
        "Public ID": r.public_id,
        Dimensiones: `${r.width}x${r.height}`,
        Formato: r.format,
        "Tamaño (KB)": (r.bytes / 1024).toFixed(2),
        "Fecha de Subida": new Date(r.uploaded_at).toLocaleString(),
      }));
      logger.info("--- ÚLTIMOS 10 ACTIVOS SUBIDOS ---", { data: recentAssets });
    } else {
      logger.info("--- ÚLTIMOS 10 ACTIVOS SUBIDOS ---", {
        data: "No se encontraron activos.",
      });
    }
    // --- [FIN DE RESTAURACIÓN DE LÓGICA] ---

    const reportDir = path.resolve(process.cwd(), "cloudinary/reports");
    await fs.mkdir(reportDir, { recursive: true });
    const reportPath = path.resolve(
      reportDir,
      `latest-content-diagnostics.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(fullReport, null, 2));

    const successMessage = `Reporte de contenido JSON guardado en: ${path.relative(process.cwd(), reportPath)}`;
    logger.success(successMessage, { traceId });
    return { success: true, data: successMessage };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("🔥 Fallo al realizar el censo de contenido en Cloudinary:", {
      error: errorMessage,
      traceId,
    });
    return { success: false, error: errorMessage };
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}

export default diagnoseCloudinaryContent;
