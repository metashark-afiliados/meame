// RUTA: shared/lib/ssg/programmatic-builder.ts
/**
 * @file programmatic-builder.ts
 * @description Utilidad de bajo nivel para invocar el build de Next.js de forma programática y contextual.
 *              v2.1.0 (Observability & TraceId Consolidation): Se añade un log de traza
 *              al inicio del módulo para confirmar su carga y se consolida el uso del `traceId`
 *              en todos los logs internos para una trazabilidad mejorada.
 * @version 2.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import { spawn } from "child_process";
import { logger } from "@/shared/lib/logging";

// --- INICIO DE MEJORA: OBSERVABILIDAD DE CARGA DE MÓDULO ---
logger.trace(
  "[ssg/programmatic-builder.ts] Módulo de builder programático SSG cargado y listo para usar."
);
// --- FIN DE MEJORA: OBSERVABILIDAD DE CARGA DE MÓDULO ---

/**
 * @function runScopedNextBuild
 * @description Ejecuta el comando `next build` en un subproceso, pasando
 *              variables de entorno específicas para un build contextual.
 * @param {string} campaignId - El ID de la campaña objetivo.
 * @param {string} variantId - El ID de la variante objetivo.
 * @param {string} tempContentDir - Directorio temporal para la sobreescritura de contenido.
 * @param {string} [traceId] - Opcional. Un ID de traza para correlacionar los logs.
 * @returns {Promise<void>} Una promesa que se resuelve cuando el build finaliza con éxito.
 * @throws {Error} Si el proceso de build falla o no se puede iniciar.
 */
export function runScopedNextBuild(
  campaignId: string,
  variantId: string,
  tempContentDir: string, // Se mantiene como requerido, ya que es crucial para el "scoped build"
  traceId?: string
): Promise<void> {
  const currentTraceId = traceId || logger.startTrace("runScopedNextBuild"); // Usa el traceId proporcionado o inicia uno nuevo
  logger.info("Iniciando proceso de build de Next.js...", {
    campaignId,
    variantId,
    isScoped: true, // Siempre es scoped con tempContentDir
    traceId: currentTraceId,
  });

  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    env.BUILD_TARGET_CAMPAIGN_ID = campaignId;
    env.BUILD_TARGET_VARIANT_ID = variantId;
    env.SSG_CONTENT_OVERRIDE_DIR = tempContentDir;
    logger.trace(
      `Build usará directorio de contenido temporal: ${tempContentDir}`,
      { traceId: currentTraceId }
    );

    const buildProcess = spawn("pnpm", ["next", "build"], {
      env: env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
    });

    let stderr = "";
    buildProcess.stdout.on("data", (data: Buffer) => {
      logger.trace(`[Next Build - STDOUT]: ${data.toString().trim()}`, {
        traceId: currentTraceId,
      });
    });
    buildProcess.stderr.on("data", (data: Buffer) => {
      const line = data.toString().trim();
      logger.error(`[Next Build - STDERR]: ${line}`, {
        traceId: currentTraceId,
      });
      stderr += line + "\n";
    });

    buildProcess.on("close", (code) => {
      if (code === 0) {
        logger.success(
          "El proceso de build de Next.js ha finalizado con éxito.",
          { traceId: currentTraceId }
        );
        if (!traceId) logger.endTrace(currentTraceId); // Solo finaliza si se inició aquí
        resolve();
      } else {
        const errorMessage = `El proceso de build de Next.js ha fallado con el código de salida: ${code}`;
        logger.error(errorMessage, { traceId: currentTraceId });
        if (!traceId) logger.endTrace(currentTraceId, { error: errorMessage }); // Finaliza y añade contexto de error
        reject(
          new Error(
            `${errorMessage}\n--- STDERR ---\n${stderr || "No stderr output."}`
          )
        );
      }
    });

    buildProcess.on("error", (err) => {
      const errorMessage = "No se pudo iniciar el proceso de build de Next.js.";
      logger.error(errorMessage, { err, traceId: currentTraceId });
      if (!traceId) logger.endTrace(currentTraceId, { error: errorMessage }); // Finaliza y añade contexto de error
      reject(new Error(`${errorMessage}: ${err.message}`));
    });
  });
}
