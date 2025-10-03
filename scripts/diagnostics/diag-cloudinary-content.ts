// scripts/diagnostics/diag-cloudinary-content.ts
/**
 * @file diag-cloudinary-content.ts
 * @description Herramienta de auditoría de contenido en Cloudinary, ahora pura.
 * @version 6.0.0 (Architecturally Pure)
 * @author L.I.A. Legacy
 */
import { v2 as cloudinary } from "cloudinary";
import * as fs from "fs/promises";
import * as path from "path";
import { loadEnvironment } from "./_utils";
import { scriptLogger, type ScriptActionResult } from "../_utils/script-logger";

async function diagnoseCloudinaryContent(): Promise<ScriptActionResult<string>> {
  scriptLogger.startGroup("📊 Realizando censo de contenido en Cloudinary...");

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
    scriptLogger.info(`Censando cloud: '${process.env.CLOUDINARY_CLOUD_NAME}'`);

    const [usage, resources] = await Promise.all([
      cloudinary.api.usage(),
      cloudinary.search
        .expression("resource_type:image")
        .sort_by("uploaded_at", "desc")
        .max_results(50)
        .execute(),
    ]);

    const fullReport = {
      usage_summary: usage,
      recent_assets: resources.resources,
    };

    const reportDir = path.resolve(process.cwd(), "reports", "cloudinary");
    await fs.mkdir(reportDir, { recursive: true });
    const reportPath = path.resolve(
      reportDir,
      `latest-content-diagnostics.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(fullReport, null, 2));

    const successMessage = `Reporte de contenido JSON guardado en: ${path.relative(process.cwd(), reportPath)}`;
    scriptLogger.success(successMessage);
    return { success: true, data: successMessage };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    scriptLogger.error("🔥 Fallo al realizar el censo de contenido en Cloudinary:", {
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  } finally {
    scriptLogger.endGroup();
  }
}

export default diagnoseCloudinaryContent;
