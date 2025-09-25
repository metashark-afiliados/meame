// RUTA: src/shared/lib/i18n/campaign.data.loader.ts
/**
 * @file campaign.data.loader.ts
 * @description Aparato Atómico: Cargador de Activos JSON.
 *              v5.2.1 (Definitive Path Restoration): Restaura la lógica de
 *              unión de rutas correcta para incluir siempre el `rootDir`,
 *              resolviendo permanentemente el error crítico de ENOENT.
 * @version 5.2.1
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import fs from "fs/promises";
import path from "path";
import { logger } from "@/shared/lib/logging";

type AssetRoot = "campaigns" | "theme-fragments";

const ASSET_ROOT_PATH_MAP: Record<AssetRoot, string> = {
  campaigns: path.join(process.cwd(), "content"),
  "theme-fragments": path.join(process.cwd(), "content"),
};

export async function loadJsonAsset<T>(
  rootDir: AssetRoot,
  ...pathSegments: string[]
): Promise<T> {
  const baseDir = ASSET_ROOT_PATH_MAP[rootDir];

  if (!baseDir) {
    const errorMsg = `[Cargador] Raíz de activo inválida: "${rootDir}".`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  // --- [INICIO DE CORRECCIÓN DE REGRESIÓN DEFINITIVA] ---
  // Se restaura el `rootDir` a la llamada de `path.join`. La ruta ahora se
  // construye correctamente como: baseDir + rootDir + pathSegments.
  // Ej: C:/.../webvork/content/ + theme-fragments/ + base/global.theme.json
  const fullPath = path.join(baseDir, rootDir, ...pathSegments);
  // --- [FIN DE CORRECCIÓN DE REGRESIÓN DEFINITIVA] ---

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
