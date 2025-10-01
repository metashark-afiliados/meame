// RUTA: scripts/run-with-env.ts
/**
 * @file run-with-env.ts
 * @description Orquestador de Scripts de Élite. Ahora unificado para consumir la SSoT `tsconfig.json`.
 * @version 8.0.0 (Unified TSConfig)
 *@author RaZ Podestá - MetaShark Tech
 */
import * as dotenv from "dotenv";
import * as path from "path";
import chalk from "chalk";
import { pathToFileURL } from "url";
import { register } from "tsconfig-paths";
import { readFileSync } from "fs";
import { logger } from "../src/shared/lib/logging";
import type {
  ActionResult,
  ErrorResult,
} from "../src/shared/lib/types/actions.types";

function setupTsConfigPaths(): void {
  try {
    // --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
    // AHORA LEE EL tsconfig.json PRINCIPAL, LA ÚNICA FUENTE DE VERDAD.
    const tsconfigPath = path.resolve(process.cwd(), "tsconfig.json");
    // --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---
    const tsconfigFileContent = readFileSync(tsconfigPath, "utf-8").replace(
      /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g,
      (match, group1) => (group1 ? "" : match)
    );
    const tsconfig = JSON.parse(tsconfigFileContent);

    if (tsconfig.compilerOptions?.paths) {
      register({
        baseUrl: path.resolve(
          process.cwd(),
          tsconfig.compilerOptions.baseUrl || "."
        ),
        paths: tsconfig.compilerOptions.paths,
      });
      logger.trace(
        "[Orquestador] Resolución de alias de tsconfig registrada con éxito."
      );
    }
  } catch (error) {
    logger.error(
      "[Orquestador] Fallo crítico al registrar los alias de tsconfig.",
      { error }
    );
    process.exit(1);
  }
}

function loadEnvironmentVariables(): void {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
  logger.trace("[Orquestador] Variables de entorno de .env.local cargadas.");
}

async function runScript() {
  const scriptPath = process.argv[2];
  const traceId = logger.startTrace(`runScript:${scriptPath || "unknown"}`);
  let executionError: Error | null = null;

  if (!scriptPath) {
    logger.error(
      "[Orquestador] No se especificó la ruta del script a ejecutar.",
      { traceId }
    );
    console.error(
      chalk.red.bold(
        "❌ Error: No se especificó la ruta del script a ejecutar."
      )
    );
    console.error(
      chalk.yellow("   Uso: pnpm tsx scripts/run-with-env.ts <ruta-al-script>")
    );
    executionError = new Error("No script path provided.");
  }

  if (!executionError) {
    try {
      logger.startGroup(
        `[Orquestador] Ejecutando: ${scriptPath}`,
        "color: #a855f7; font-weight: bold;"
      );
      process.env.NEXT_RUNTIME = "nodejs";

      const absolutePath = path.resolve(process.cwd(), scriptPath);
      const scriptUrl = pathToFileURL(absolutePath).href;

      logger.traceEvent(
        traceId,
        "Importando módulo del script dinámicamente...",
        {
          url: scriptUrl,
        }
      );
      const scriptModule = await import(scriptUrl);
      const mainFunction = scriptModule.default;

      if (typeof mainFunction !== "function") {
        throw new Error(
          `El script ${scriptPath} no cumple con el contrato del Orquestador. Debe exportar una función por defecto ('export default').`
        );
      }

      logger.traceEvent(traceId, "Invocando función principal del script...");
      const result = (await mainFunction()) as ActionResult<unknown> | unknown;

      if (
        result &&
        typeof result === "object" &&
        "success" in result &&
        typeof result.success === "boolean"
      ) {
        const actionResult = result as ActionResult<unknown>;
        if (actionResult.success) {
          logger.success("El script finalizó con éxito.", { traceId });
          if (actionResult.data) {
            console.log(chalk.greenBright("   Resultado:"), actionResult.data);
          }
        } else {
          const errorResult = actionResult as ErrorResult;
          logger.error("El script finalizó con un error controlado.", {
            details: errorResult.error,
            traceId,
          });
          executionError = new Error(errorResult.error);
        }
      } else {
        logger.warn(
          "El script se ejecutó pero no devolvió un ActionResult estándar. Se considera una ejecución exitosa pero sin resultado observable.",
          { traceId }
        );
      }
    } catch (error) {
      executionError =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = executionError.message;
      logger.error(`[Orquestador] Fallo crítico al ejecutar '${scriptPath}'`, {
        error: errorMessage,
        traceId,
      });
    } finally {
      logger.endGroup();
    }
  }

  logger.endTrace(
    traceId,
    executionError ? { error: executionError.message } : {}
  );
  if (executionError) {
    process.exit(1);
  }
}

setupTsConfigPaths();
loadEnvironmentVariables();
runScript();
