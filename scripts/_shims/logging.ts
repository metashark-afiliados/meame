// scripts/_shims/logging.ts
/**
 * @file logging.ts (SHIM)
 * @description Réplica funcional del logger para el entorno de scripts. Usa console.log.
 * @version 1.1.0 (Timestamp Fix)
 */
import chalk from "chalk";

const getTimestamp = (): string => new Date().toISOString();

export const logger = {
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
  traceEvent: (traceId: string, eventName: string, context?: object) =>
    console.log(
      chalk.gray(`[${getTimestamp()}] ➡️ [${traceId}] ${eventName}`),
      context || ""
    ),
  startTrace: (name: string) => `trace_${name}_${Date.now()}`,
  endTrace: () => {},
};
