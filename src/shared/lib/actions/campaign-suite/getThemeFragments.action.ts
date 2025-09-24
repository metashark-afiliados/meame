// app/[locale]/(dev)/dev/campaign-suite/_actions/getThemeFragments.action.ts
/**
 * @file getThemeFragments.action.ts
 * @description Server Action para descubrir y listar los fragmentos de tema disponibles.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { promises as fs } from "fs";
import path from "path";
import { netTracePrefixToPathMap } from "@/shared/lib/config/theming.config";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";

export type ThemeFragmentCategory = "colors" | "fonts" | "radii";
export type DiscoveredFragments = Record<ThemeFragmentCategory, string[]>;

/**
 * @function getThemeFragmentsAction
 * @description Escanea el directorio `content/theme-fragments` para descubrir
 *              los presets de temas disponibles para cada categoría.
 * @returns {Promise<ActionResult<DiscoveredFragments>>} Un objeto con las listas de fragmentos.
 */
export async function getThemeFragmentsAction(): Promise<
  ActionResult<DiscoveredFragments>
> {
  logger.info("[Action] Descubriendo fragmentos de tema disponibles...");

  const results: DiscoveredFragments = {
    colors: [],
    fonts: [],
    radii: [],
  };

  try {
    for (const prefix in netTracePrefixToPathMap) {
      const categoryDir =
        netTracePrefixToPathMap[prefix as keyof typeof netTracePrefixToPathMap];
      const fullPath = path.join(
        process.cwd(),
        "content",
        "theme-fragments",
        categoryDir
      );

      const files = await fs.readdir(fullPath);

      const fragmentNames = files
        .filter((file) => file.endsWith(`.${categoryDir}.json`))
        .map((file) => file.replace(`.${categoryDir}.json`, ""));

      if (categoryDir in results) {
        results[categoryDir as ThemeFragmentCategory] = fragmentNames;
      }
    }

    logger.success("Fragmentos de tema descubiertos con éxito.", {
      fragments: results,
    });
    return { success: true, data: results };
  } catch (error) {
    logger.error("Error al descubrir los fragmentos de tema.", { error });
    return {
      success: false,
      error:
        "No se pudieron cargar las opciones de tema desde el servidor. Verifique la estructura de archivos en 'content/theme-fragments'.",
    };
  }
}
// app/[locale]/(dev)/dev/campaign-suite/_actions/getThemeFragments.action.ts
