// RUTA: scripts/supabase/diagnose-content.ts
/**
 * @file diagnose-content.ts
 * @description Herramienta de auditoría de contenido, ahora con manejo de errores de red de élite.
 * @version 5.0.0 (Network Resilience & Elite Observability)
 *@author RaZ Podestá - MetaShark Tech
 */
import { createClient } from "@supabase/supabase-js";
import chalk from "chalk";
import { promises as fs } from "fs";
import * as path from "path";
import { loadEnvironment } from "./_utils";
import type { ActionResult } from "../../src/shared/lib/types/actions.types";
import { logger } from "../../src/shared/lib/logging";

async function diagnoseContent(): Promise<ActionResult<string>> {
  const traceId = logger.startTrace("diagnoseContent_v5.0");
  logger.startGroup("[DB Content Census] Iniciando censo de contenido v5.0...");

  try {
    loadEnvironment();

    const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
    if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return {
        success: false,
        error: "Variables de Supabase no definidas en .env.local",
      };
    }

    const supabaseAdmin = createClient(
      NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    logger.info(
      "Invocando RPC 'get_content_diagnostics' en el entorno remoto..."
    );
    const { data: report, error } = await supabaseAdmin.rpc(
      "get_content_diagnostics"
    );

    if (error) {
      // Re-lanzar el error para que sea capturado por el guardián de resiliencia.
      throw error;
    }
    logger.success("Censo de contenido completado desde la RPC.");

    if (!report) {
      logger.warn("La RPC no devolvió datos. El informe estará vacío.");
      return { success: true, data: "La RPC no devolvió datos." };
    }

    console.log(chalk.blueBright.bold(`\n--- CENSO DE ENTIDADES ---`));
    console.table(
      Object.entries(report.entity_counts ?? {}).map(([Tabla, Registros]) => ({
        Tabla,
        Registros,
      }))
    );
    // ... (resto de la lógica de impresión en consola) ...

    const reportDir = path.resolve(process.cwd(), "supabase/reports");
    await fs.mkdir(reportDir, { recursive: true });
    const reportPath = path.resolve(
      reportDir,
      `latest-content-diagnostics.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    const relativePath = path.relative(process.cwd(), reportPath);

    return { success: true, data: `Reporte guardado en: ${relativePath}` };
  } catch (error) {
    // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA v5.0.0] ---
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("Fallo crítico durante el censo de contenido.", {
      error: errorMessage,
      traceId,
    });

    if (errorMessage.includes("fetch failed")) {
      return {
        success: false,
        error:
          "Fallo de red al conectar con Supabase. Verifica tu conexión a internet, VPN o configuración de firewall.",
      };
    }

    return {
      success: false,
      error: `Fallo al ejecutar RPC 'get_content_diagnostics': ${errorMessage}`,
    };
    // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA v5.0.0] ---
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}

export default diagnoseContent;
