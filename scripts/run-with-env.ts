// RUTA: scripts/run-with-env.ts
/**
 * @file run-with-env.ts
 * @description Orquestador de Scripts de Élite y SSoT para la ejecución de
 *              tareas de línea de comandos. Inyecta el entorno, los alias de
 *              ruta, y proporciona un framework robusto para la ejecución y
 *              observabilidad de CUALQUIER script en el ecosistema.
 * @version 5.0.0 (Elite Orchestrator & Observability Engine)
 * @author L.I.A. Legacy - Asistente de Refactorización
 */
import * as dotenv from "dotenv";
import * as path from "path";
import chalk from "chalk";
import { pathToFileURL } from "url";
import { register } from "tsconfig-paths";
import { readFileSync } from "fs";
import { logger } from "../src/shared/lib/logging";
import type { ActionResult } from "../src/shared/lib/types/actions.types";

/**
 * @function setupTsConfigPaths
 * @description Lee el `tsconfig.scripts.json`, parsea las rutas de alias y las
 *              registra para que el entorno de ejecución de Node.js pueda
 *              resolver importaciones como '@/shared/lib/logging'.
 * @private
 */
function setupTsConfigPaths(): void {
  try {
    const tsconfigPath = path.resolve(process.cwd(), "tsconfig.scripts.json");
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

/**
 * @function loadEnvironmentVariables
 * @description Carga las variables de entorno desde el archivo .env.local.
 * @private
 */
function loadEnvironmentVariables(): void {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
  logger.trace("[Orquestador] Variables de entorno de .env.local cargadas.");
}

/**
 * @function runScript
 * @description La función principal del orquestador. Parsea los argumentos de la
 *              línea de comandos, importa dinámicamente el script solicitado,
 *              ejecuta su función `default`, e interpreta y reporta el resultado.
 * @async
 */
async function runScript() {
  const scriptPath = process.argv[2];
  const traceId = logger.startTrace(`runScript:${scriptPath || "unknown"}`);

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
    logger.endTrace(traceId, { error: "No script path provided." });
    process.exit(1);
  }

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

    // --- Manejo Robusto del Resultado ---
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
        logger.error("El script finalizó con un error controlado.", {
          details: actionResult.error,
          traceId,
        });
      }
    } else {
      logger.warn(
        "El script se ejecutó pero no devolvió un ActionResult estándar. Se considera una ejecución exitosa pero sin resultado observable.",
        { traceId }
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(`[Orquestador] Fallo crítico al ejecutar '${scriptPath}'`, {
      error: errorMessage,
      traceId,
    });
    logger.endTrace(traceId, { error: errorMessage });
    process.exit(1);
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}

// Punto de Entrada: Orquesta la inicialización y ejecución.
setupTsConfigPaths();
loadEnvironmentVariables();
runScript();
