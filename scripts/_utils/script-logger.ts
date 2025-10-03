// RUTA: scripts/_utils/script-logger.ts
/**
 * @file script-logger.ts (SHIM)
 * @description Réplica funcional y completa del logger para el entorno de scripts.
 * @version 2.0.0 (API Complete & Resilient)
 */
import chalk from "chalk";

const getTimestamp = (): string => new Date().toISOString();

export const scriptLogger = {
  startGroup: (label: string) =>
    console.log(
      chalk.blue.bold(`\n[${getTimestamp()}] ===== [START] ${label} =====`)
    ),
  endGroup: () =>
    console.log(chalk.blue.bold(`[${getTimestamp()}] ===== [END] =====\n`)),
  success: (message: string, context?: object) =>
    console.log(
      chalk.green(`[${getTimestamp()}] ✅ [SUCCESS] ${message}`),
      context || ""
    ),
  info: (message: string, context?: object) =>
    console.log(
      chalk.cyan(`[${getTimestamp()}] ℹ️ [INFO] ${message}`),
      context || ""
    ),
  warn: (message: string, context?: object) =>
    console.warn(
      chalk.yellow(`[${getTimestamp()}] ⚠️ [WARN] ${message}`),
      context || ""
    ),
  error: (message: string, context?: object) =>
    console.error(
      chalk.red.bold(`[${getTimestamp()}] ❌ [ERROR] ${message}`),
      context || ""
    ),
  trace: (message: string, context?: object) =>
    console.log(
      chalk.gray(`[${getTimestamp()}] • [TRACE] ${message}`),
      context || ""
    ),
  startTrace: (name: string): string => {
    const traceId = `trace_${name}_${Date.now()}`;
    console.log(
      chalk.magenta(`[${getTimestamp()}] 🔗 TRACE START: ${traceId} (${name})`)
    );
    return traceId;
  },
  traceEvent: (traceId: string, eventName: string, context?: object) =>
    console.log(
      chalk.magenta(`[${getTimestamp()}]  ➡️  [${traceId}] ${eventName}`),
      context || ""
    ),
  endTrace: (traceId: string, context?: object) =>
    console.log(
      chalk.magenta(`[${getTimestamp()}] 🏁 TRACE END: ${traceId}`),
      context || ""
    ),
};

export type ScriptActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
