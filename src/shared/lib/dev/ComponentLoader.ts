// RUTA: src/shared/lib/dev/ComponentLoader.ts
/**
 * @file ComponentLoader.ts
 * @description Módulo de servicio SOBERANO para la carga dinámica de componentes.
 *              v7.0.0 (Sovereign Path Restoration): Se corrige la ruta de importación
 *              de la utilidad de props para alinearse con la ACS, restaurando la
 *              integridad del build del DCC.
 * @version 7.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server-only";

import React from "react";
import {
  getComponentByName,
  type ComponentRegistryEntry,
} from "@/shared/lib/dev/ComponentRegistry";
import { logger } from "@/shared/lib/logging";
// --- [INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
// Se corrige la ruta de importación para apuntar a la SSoT canónica en la capa de features.
import { getFallbackProps } from "@/components/features/dev-tools/utils/component-props";
// --- [FIN DE REFACTORIZACIÓN ARQUITECTÓNICA] ---

interface ComponentLoadResult {
  ComponentToRender: React.ComponentType<Record<string, unknown>>;
  componentProps: Record<string, unknown>;
  entry: ComponentRegistryEntry;
}

export async function loadComponentAndProps(
  componentName: string
): Promise<ComponentLoadResult> {
  logger.startGroup(`[Loader v7.0] Cargando "${componentName}"`);

  const entry = getComponentByName(componentName);
  if (!entry) {
    const errorMsg = `Componente "${componentName}" no encontrado en ComponentRegistry.`;
    logger.error(errorMsg);
    logger.endGroup();
    throw new Error(errorMsg);
  }

  const componentProps = getFallbackProps(componentName);

  try {
    const dynamicPath = `@/` + entry.componentPath.replace("@/", "");
    const componentModule = await import(dynamicPath);

    const ComponentToRender =
      componentModule.default ||
      componentModule[componentName] ||
      componentModule[entry.dictionaryKey] ||
      componentModule[Object.keys(componentModule)[0]];

    if (!ComponentToRender) {
      throw new Error(
        `Exportación por defecto o nombrada no encontrada en "${entry.componentPath}"`
      );
    }

    logger.success(
      `Componente "${componentName}" cargado dinámicamente con éxito.`
    );
    logger.endGroup();

    return { ComponentToRender, componentProps, entry };
  } catch (error) {
    const errorMsg = `Error crítico al importar dinámicamente el módulo para "${componentName}".`;
    logger.error(errorMsg, { path: entry.componentPath, error });
    logger.endGroup();
    throw new Error(
      `No se pudo cargar el módulo del componente: ${entry.componentPath}`
    );
  }
}
// RUTA: src/shared/lib/dev/ComponentLoader.ts
