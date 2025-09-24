// lib/i18n/campaign.data.loader.ts
/**
 * @file campaign.data.loader.ts
 * @description Aparato Atómico: Cargador de Activos JSON.
 *              v5.0.0 (Declarative Architecture): Refactorizado para utilizar un
 *              mapa de configuración declarativo (SSoT) para las rutas de activos,
 *              eliminando la lógica condicional y mejorando la mantenibilidad.
 * @version 5.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import fs from "fs/promises";
import path from "path";
import { logger } from "@/shared/lib/logging";

/**
 * @type AssetRoot
 * @description Define los tipos de directorios raíz de activos que el sistema puede cargar.
 */
type AssetRoot = "campaigns" | "theme-fragments";

/**
 * @const ASSET_ROOT_PATH_MAP
 * @description SSoT declarativa que mapea un tipo de activo a su directorio base físico.
 *              Esta es la Única Fuente de Verdad para la ubicación de los activos de contenido.
 */
const ASSET_ROOT_PATH_MAP: Record<AssetRoot, string> = {
  campaigns: path.join(process.cwd(), "content"),
  "theme-fragments": path.join(process.cwd(), "public"),
};

/**
 * @function loadJsonAsset
 * @description Carga y parsea un activo JSON desde el sistema de archivos.
 *              Utiliza el ASSET_ROOT_PATH_MAP para resolver la ruta base correcta.
 * @template T - El tipo esperado del contenido del JSON.
 * @param {AssetRoot} rootDir - El tipo de raíz del activo a cargar.
 * @param {...string[]} pathSegments - Los segmentos de ruta subsiguientes.
 * @returns {Promise<T>} El contenido del archivo JSON, parseado y tipado.
 * @throws {Error} Si la `rootDir` es inválida, el archivo no se encuentra, o falla el parseo.
 */
export async function loadJsonAsset<T>(
  rootDir: AssetRoot,
  ...pathSegments: string[]
): Promise<T> {
  const baseDir = ASSET_ROOT_PATH_MAP[rootDir];

  if (!baseDir) {
    const errorMsg = `[Cargador] Raíz de activo inválida: "${rootDir}". No está registrada en ASSET_ROOT_PATH_MAP.`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Construye la ruta final, ej: /path/to/project/public/theme-fragments/colors/scientific.colors.json
  const fullPath = path.join(baseDir, rootDir, ...pathSegments);
  const relativePath = path.relative(process.cwd(), fullPath);

  logger.trace(`[Cargador] Cargando activo JSON desde: "${relativePath}"`);

  try {
    const fileContent = await fs.readFile(fullPath, "utf-8");
    return JSON.parse(fileContent) as T;
  } catch (error: unknown) {
    logger.error(
      `[Cargador] Fallo crítico al cargar activo desde "${relativePath}"`,
      { error }
    );
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(`Activo no encontrado: ${relativePath}`);
    }
    throw new Error(`No se pudo cargar o parsear el activo: ${relativePath}`);
  }
}
// lib/i18n/campaign.data.loader.ts
