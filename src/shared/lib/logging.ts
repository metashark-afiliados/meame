// RUTA: src/shared/lib/logging.ts
/**
 * @file logging.ts
 * @description Aparato SSoT para el logging. Implementación isomórfica sin
 *              dependencias, compatible con todos los entornos de Vercel.
 * @version 12.0.0 (Pino-Free & Universal Compatibility)
 * @author RaZ Podestá - MetaShark Tech
 */

// Estilos de consola para una mejor visualización en desarrollo.
const STYLES = {
  orchestrator: "color: #8b5cf6; font-weight: bold;",
  hook: "color: #3b82f6; font-weight: bold;",
  success: "color: #22c55e; font-weight: bold;",
  info: "color: #60a5fa;",
  warn: "color: #f59e0b;",
  error: "color: #ef4444; font-weight: bold;",
  trace: "color: #a1a1aa;",
  timestamp: "color: #64748b;",
  timer: "color: #14b8a6;",
};

// Determina si estamos en un entorno de navegador.
const isBrowser = typeof window !== "undefined";

// Define la interfaz del logger para asegurar un contrato consistente.
interface Logger {
  startGroup: (label: string, style?: string) => void;
  endGroup: () => void;
  success: (message: string, context?: object) => void;
  info: (message: string, context?: object) => void;
  warn: (message: string, context?: object) => void;
  error: (message: string, context?: object) => void;
  trace: (message: string, context?: object) => void;
  time: (label: string) => void;
  timeEnd: (label: string) => void;
  startTrace: (traceName: string) => string;
  traceEvent: (traceId: string, eventName: string, context?: object) => void;
  endTrace: (traceId: string, context?: object) => void;
}

const timers = new Map<string, number>();
const traces = new Map<string, { name: string; startTime: number }>();

const getTimestamp = (): string => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const ms = String(now.getMilliseconds()).padStart(3, "0");
  return `${h}:${m}:${s}.${ms}`;
};

// Logger para el entorno de desarrollo
const developmentLogger: Logger = {
  startGroup: (label, style = STYLES.hook) => {
    const timestamp = getTimestamp();
    if (isBrowser) {
      console.groupCollapsed(
        `%c[${timestamp}] %c▶ ${label}`,
        STYLES.timestamp,
        style
      );
    } else {
      console.log(`[${timestamp}] ▶ GROUP START: ${label}`);
    }
  },
  endGroup: () => {
    if (isBrowser) {
      console.groupEnd();
    } else {
      console.log(`[${getTimestamp()}] ◀ GROUP END`);
    }
  },
  success: (message, context) => {
    const timestamp = getTimestamp();
    if (isBrowser) {
      console.log(
        `%c[${timestamp}] %c✅ ${message}`,
        STYLES.timestamp,
        STYLES.success,
        ...(context ? [context] : [])
      );
    } else {
      console.log(`[${timestamp}] ✅ ${message}`, context || "");
    }
  },
  info: (message, context) => {
    const timestamp = getTimestamp();
    if (isBrowser) {
      console.info(
        `%c[${timestamp}] %cℹ️ ${message}`,
        STYLES.timestamp,
        STYLES.info,
        ...(context ? [context] : [])
      );
    } else {
      console.info(`[${timestamp}] ℹ️ ${message}`, context || "");
    }
  },
  warn: (message, context) => {
    const timestamp = getTimestamp();
    if (isBrowser) {
      console.warn(
        `%c[${timestamp}] %c⚠️ ${message}`,
        STYLES.timestamp,
        STYLES.warn,
        ...(context ? [context] : [])
      );
    } else {
      console.warn(`[${timestamp}] ⚠️ ${message}`, context || "");
    }
  },
  error: (message, context) => {
    const timestamp = getTimestamp();
    if (isBrowser) {
      console.error(
        `%c[${timestamp}] %c❌ ${message}`,
        STYLES.timestamp,
        STYLES.error,
        ...(context ? [context] : [])
      );
    } else {
      console.error(`[${timestamp}] ❌ ${message}`, context || "");
    }
  },
  trace: (message, context) => {
    const timestamp = getTimestamp();
    if (isBrowser) {
      console.log(
        `%c[${timestamp}] %c• ${message}`,
        STYLES.timestamp,
        STYLES.trace,
        ...(context ? [context] : [])
      );
    } else {
      console.log(`[${timestamp}] • ${message}`, context || "");
    }
  },
  time: (label) => {
    timers.set(label, performance.now());
  },
  timeEnd: (label) => {
    const startTime = timers.get(label);
    if (startTime !== undefined) {
      const duration = (performance.now() - startTime).toFixed(2);
      const timestamp = getTimestamp();
      if (isBrowser) {
        console.log(
          `%c[${timestamp}] %c⏱️ Timer [${label}]: ${duration}ms`,
          STYLES.timestamp,
          STYLES.timer
        );
      } else {
        console.log(`[${timestamp}] ⏱️ Timer [${label}]: ${duration}ms`);
      }
      timers.delete(label);
    }
  },
  startTrace: (traceName) => {
    const traceId = `${traceName}-${Math.random().toString(36).substring(2, 9)}`;
    traces.set(traceId, { name: traceName, startTime: performance.now() });
    developmentLogger.info(`🔗 Trace Start: ${traceId} (${traceName})`);
    return traceId;
  },
  traceEvent: (traceId, eventName, context) => {
    developmentLogger.info(`➡️ [${traceId}] ${eventName}`, context);
  },
  endTrace: (traceId, context) => {
    const trace = traces.get(traceId);
    if (trace) {
      const duration = (performance.now() - trace.startTime).toFixed(2);
      developmentLogger.success(
        `🏁 Trace End: ${traceId} (${trace.name}) - Total Duration: ${duration}ms`,
        context
      );
      traces.delete(traceId);
    }
  },
};

// Logger para producción (más simple, sin colores)
const productionLogger: Logger = {
  startGroup: (label) => console.log(`[GROUP START] ${label}`),
  endGroup: () => console.log(`[GROUP END]`),
  success: (message, context) => console.log(`✅ [SUCCESS] ${message}`, context || ""),
  info: (message, context) => console.info(`ℹ️ [INFO] ${message}`, context || ""),
  warn: (message, context) => console.warn(`⚠️ [WARN] ${message}`, context || ""),
  error: (message, context) => console.error(`❌ [ERROR] ${message}`, context || ""),
  trace: () => {}, // Los logs de traza se omiten en producción
  time: () => {},
  timeEnd: () => {},
  startTrace: (traceName) => {
    const traceId = `prod-trace-${Math.random().toString(36).substring(2, 9)}`;
    productionLogger.info(`🔗 Trace Start: ${traceId} (${traceName})`);
    return traceId;
  },
  traceEvent: () => {}, // Los eventos de traza se omiten en producción
  endTrace: (traceId, context) => {
    productionLogger.success(`🏁 Trace End: ${traceId}`, context);
  },
};

export const logger =
  process.env.NODE_ENV === "development"
    ? developmentLogger
    : productionLogger;
