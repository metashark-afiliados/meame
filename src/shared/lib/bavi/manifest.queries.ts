// RUTA: src/shared/lib/bavi/manifest.queries.ts
/**
 * @file manifest.queries.ts
 * @description SSoT para las operaciones de lectura del manifiesto BAVI.
 *              Esta es la única fuente de verdad para acceder a los metadatos
 *              de los activos desde el servidor. Inyectado con MEA de performance
 *              a través de React.cache.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";

import { promises as fs } from "fs";
import path from "path";
import {
  BaviManifestSchema,
  type BaviManifest,
} from "@/shared/lib/schemas/bavi/bavi.manifest.schema";
import { logger } from "@/shared/lib/logging";
import { cache } from "react"; // MEA/UX de Performance

const BAVI_MANIFEST_PATH = path.join(
  process.cwd(),
  "content/bavi/bavi.manifest.json"
);

/**
 * @function getBaviManifest
 * @description Lee, parsea y valida el bavi.manifest.json. La función está
 *              envuelta en `React.cache` para una performance de élite, asegurando
 *              que el archivo solo se lea una vez por petición de renderizado.
 * @returns {Promise<BaviManifest>} El manifiesto validado.
 * @throws {Error} Si el manifiesto no se encuentra o está corrupto.
 */
export const getBaviManifest = cache(
  async (): Promise<BaviManifest> => {
    logger.trace("[BAVI DAL] Solicitando manifiesto BAVI...");
    try {
      const fileContent = await fs.readFile(BAVI_MANIFEST_PATH, "utf-8");
      const jsonData = JSON.parse(fileContent);
      const validation = BaviManifestSchema.safeParse(jsonData);

      if (!validation.success) {
        logger.error("[BAVI DAL] El manifiesto BAVI está corrupto.", {
          error: validation.error.flatten(),
        });
        throw new Error("El manifiesto BAVI no superó la validación.");
      }

      logger.success("[BAVI DAL] Manifiesto BAVI cargado y validado con éxito.");
      return validation.data;
    } catch (error) {
      logger.error("[BAVI DAL] Fallo crítico al cargar el manifiesto BAVI.", {
        error,
      });
      // Propagamos el error para que los componentes puedan manejarlo.
      throw new Error("No se pudo cargar la biblioteca de activos visuales.");
    }
  }
);
