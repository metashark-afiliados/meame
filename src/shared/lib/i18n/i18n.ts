// RUTA: shared/lib/i18n/i18n.ts
/**
 * @file i18n.ts
 * @description Orquestador de i18n consciente del entorno. Delega la carga
 *              de diccionarios al motor apropiado. En producción, utiliza
 *              `React.cache` para memoizar la lectura de archivos.
 *              v17.1.0 (Module Load Observability & Production Error Handling):
 *              Se añade un log de traza al inicio del módulo y se mejora el
 *              manejo de errores en producción para diccionarios corruptos,
 *              lanzando un error que Next.js puede capturar.
 * @version 17.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import { cache } from "react";
import * as fs from "fs/promises";
import * as path from "path";
import { type ZodError } from "zod";
import { i18nSchema, type Dictionary } from "@/shared/lib/schemas/i18n.schema";
import {
  supportedLocales,
  defaultLocale,
  type Locale,
} from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { getDevDictionary } from "@/shared/lib/i18n/i18n.dev";

// --- INICIO DE MEJORA: OBSERVABILIDAD DE CARGA DE MÓDULO ---
logger.trace("[i18n.ts] Módulo orquestador i18n cargado y listo para usar.");
// --- FIN DE MEJORA: OBSERVABILIDAD DE CARGA DE MÓDULO ---

// --- Lógica de Producción Cacheada ---

const prodDictionariesCache: Partial<
  Record<
    Locale,
    { dictionary: Partial<Dictionary>; error: ZodError | Error | null }
  >
> = {};

/**
 * @function getProductionDictionary
 * @description Lógica pura para cargar y validar un diccionario en producción.
 *              Esta función será envuelta por `React.cache`.
 *              En producción, un diccionario inválido lanzará un error.
 * @private
 */
const getProductionDictionary = async (
  locale: Locale
): Promise<{
  dictionary: Partial<Dictionary>;
  error: ZodError | Error | null;
}> => {
  if (prodDictionariesCache[locale]) {
    logger.trace(
      `[i18n Orquestador - PROD] Sirviendo diccionario para [${locale}] desde caché de petición.`
    );
    return prodDictionariesCache[locale]!;
  }

  logger.trace(
    `[i18n Orquestador - PROD] Leyendo del sistema de archivos para [${locale}].`
  );

  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "locales",
      `${locale}.json`
    );
    const fileContent = await fs.readFile(filePath, "utf-8");
    const dictionary = JSON.parse(fileContent);

    const validation = i18nSchema.safeParse(dictionary);
    if (!validation.success) {
      logger.error(
        `[i18n Orquestador - PROD] ¡FALLO CRÍTICO DE VALIDACIÓN! Diccionario para "${locale}" está corrupto.`,
        { errors: validation.error.flatten().fieldErrors }
      );
      // --- INICIO DE MEJORA: LANZAR ERROR EN PRODUCCIÓN ---
      // En producción, un diccionario corrupto debe causar un fallo explícito.
      throw new Error(`Diccionario i18n para '${locale}' corrupto o inválido.`);
      // --- FIN DE MEJORA ---
    }

    const result = { dictionary: validation.data, error: null };
    prodDictionariesCache[locale] = result;
    return result;
  } catch (error) {
    logger.error(
      `[i18n Orquestador - PROD] No se pudo cargar el diccionario para ${locale}.`,
      { error }
    );
    // Para errores de lectura de archivo o JSON.parse, también lanzamos un error.
    throw error;
  }
};

/**
 * @const getCachedProductionDictionary
 * @description Versión memoizada de `getProductionDictionary` usando `React.cache`.
 *              Asegura que, dentro de un mismo ciclo de renderizado en servidor,
 *              la lectura de un archivo de locale solo ocurra una vez.
 */
const getCachedProductionDictionary = cache(getProductionDictionary);

// --- Orquestador Principal ---

/**
 * @function getDictionary
 * @description SSoT para la obtención de diccionarios i18n.
 *              Detecta el entorno y utiliza la estrategia de carga óptima.
 * @param {string} locale - El código de idioma solicitado (ej. "es-ES").
 * @returns {Promise<{ dictionary: Partial<Dictionary>; error: ZodError | Error | null; }>}
 */
export const getDictionary = async (
  locale: string
): Promise<{
  dictionary: Partial<Dictionary>;
  error: ZodError | Error | null;
}> => {
  const validatedLocale = supportedLocales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;

  if (process.env.NODE_ENV === "development") {
    logger.trace(`[i18n Orquestador] Entorno DEV. Delegando a i18n.dev.ts...`);
    return getDevDictionary(validatedLocale);
  }

  logger.trace(`[i18n Orquestador] Entorno PROD. Usando motor cacheado...`);
  try {
    return await getCachedProductionDictionary(validatedLocale);
  } catch (error) {
    // Captura cualquier error lanzado por getProductionDictionary
    return {
      dictionary: {},
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};
