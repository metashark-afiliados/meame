// RUTA: src/shared/lib/ssg/programmatic-builder.ts
/**
 * @file programmatic-builder.ts
 * @description Utilidad de bajo nivel para invocar el build de Next.js de forma
 *              programática y observar su resultado.
 * @version 2.0.0 (Elite & Resilient)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server-only";

import { spawn } from "child_process";
import { logger } from "@/shared/lib/logging";

export function runScopedNextBuild(
  tempDir: string,
  traceId: string
): Promise<void> {
  logger.info("Iniciando proceso de build de Next.js...", {
    directory: tempDir,
    traceId,
  });

  return new Promise((resolve, reject) => {
    const buildProcess = spawn("pnpm", ["next", "build"], {
      cwd: tempDir, // Ejecuta el comando en el directorio temporal
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
      env: { ...process.env },
    });

    let stderr = "";
    buildProcess.stdout?.on("data", (data: Buffer) => {
      logger.trace(`[Next Build - STDOUT]: ${data.toString().trim()}`, {
        traceId,
      });
    });
    buildProcess.stderr?.on("data", (data: Buffer) => {
      const line = data.toString().trim();
      logger.error(`[Next Build - STDERR]: ${line}`, { traceId });
      stderr += line + "\n";
    });

    buildProcess.on("close", (code) => {
      if (code === 0) {
        logger.success(
          "El proceso de build de Next.js ha finalizado con éxito.",
          { traceId }
        );
        resolve();
      } else {
        const errorMessage = `El build de Next.js falló con código ${code}`;
        logger.error(errorMessage, { traceId });
        reject(new Error(`${errorMessage}\n--- Errores ---\n${stderr}`));
      }
    });

    buildProcess.on("error", (err) => {
      const errorMessage = "No se pudo iniciar el proceso de build de Next.js.";
      logger.error(errorMessage, { error: err, traceId });
      reject(new Error(`${errorMessage}: ${err.message}`));
    });
  });
}
