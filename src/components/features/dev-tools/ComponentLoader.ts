// RUTA: src/components/features/dev-tools/ComponentLoader.ts
/**
 * @file ComponentLoader.ts
 * @description Módulo de servicio para la carga dinámica de componentes.
 *              v5.0.0 (Client-Side Purity): Refactorizado para eliminar toda
 *              lógica de obtención de datos del servidor, resolviendo el error
 *              crítico de build "Module not found: 'net'".
 * @version 5.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import {
  getComponentByName,
  type ComponentRegistryEntry,
} from "@/components/dev/ComponentRegistry";
import { logger } from "@/shared/lib/logging";
import { getFallbackProps } from "@/components/features/dev-tools/utils/component-props";

interface ComponentLoadResult {
  ComponentToRender: React.ComponentType<Record<string, unknown>>;
  componentProps: Record<string, unknown>;
  entry: ComponentRegistryEntry;
}

export async function loadComponentAndProps(
  componentName: string
): Promise<ComponentLoadResult> {
  logger.startGroup(`[Loader v5.0] Cargando "${componentName}" (Client-Safe)`);

  const entry = getComponentByName(componentName);
  if (!entry) {
    const errorMsg = `Componente "${componentName}" no encontrado en ComponentRegistry.`;
    logger.error(errorMsg);
    logger.endGroup();
    throw new Error(errorMsg);
  }

  // Se utilizan props de fallback estáticas, una operación segura en el cliente.
  const componentProps = getFallbackProps(componentName);

  try {
    const componentModule = await import(
      `../../${entry.componentPath.replace("@/", "")}`
    );
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
