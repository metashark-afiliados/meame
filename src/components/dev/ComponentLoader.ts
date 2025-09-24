// Ruta correcta: src/components/dev/ComponentLoader.ts
/**
 * @file ComponentLoader.ts
 * @description Módulo de servicio para la carga dinámica de componentes en el Dev Canvas.
 *              v4.4.0 (Type Safety Fix): Resuelve el error TS2538 mediante una
 *              aserción de tipo segura, garantizando la correcta indexación de
 *              objetos de diccionario complejos.
 * @version 4.4.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import {
  getComponentByName,
  type ComponentRegistryEntry,
} from "./ComponentRegistry";
import { logger } from "@/shared/lib/logging";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { getCampaignData } from "@/shared/lib/i18n/campaign.i18n";
import { getFallbackProps } from "@/components/features/dev-tools/utils/component-props";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";

interface ComponentLoadResult {
  ComponentToRender: React.ComponentType<Record<string, unknown>>;
  componentProps: Record<string, unknown>;
  appliedTheme: AssembledTheme | null;
  entry: ComponentRegistryEntry;
}

const DEV_MOCK_VARIANT_ID = "02"; // Vitality

export async function loadComponentAndProps(
  componentName: string,
  locale: string
): Promise<ComponentLoadResult> {
  logger.startGroup(`[Loader] Cargando "${componentName}"`);

  const entry = getComponentByName(componentName);
  if (!entry) {
    const errorMsg = `Componente "${componentName}" no encontrado en ComponentRegistry.`;
    logger.error(errorMsg);
    logger.endGroup();
    throw new Error(errorMsg);
  }

  let componentProps: Record<string, unknown> = {};
  let appliedTheme: AssembledTheme | null = null;
  let dictionary: Partial<Dictionary> = {};

  try {
    if (entry.isCampaignComponent) {
      const campaignData = await getCampaignData(
        "12157",
        locale,
        DEV_MOCK_VARIANT_ID
      );
      dictionary = campaignData.dictionary;
      appliedTheme = campaignData.theme;
    } else {
      const { dictionary: globalDictionary } = await getDictionary(locale);
      dictionary = globalDictionary;
    }

    const key = entry.dictionaryKey;
    // --- [INICIO DE CORRECCIÓN DE TIPO TS2538] ---
    // Se realiza una aserción de tipo para tratar el diccionario como un Record
    // genérico, asegurando a TypeScript que estamos indexando con un string.
    const propsFromDict = (dictionary as Record<string, unknown>)[key];
    // --- [FIN DE CORRECCIÓN DE TIPO TS2538] ---

    componentProps = propsFromDict
      ? { content: propsFromDict }
      : getFallbackProps(componentName);

    if (componentName === "Header") {
      componentProps.devDictionary = dictionary.devRouteMenu;
    }

    logger.trace("Props de i18n cargadas exitosamente.");
  } catch (error) {
    logger.error(
      `Fallo al cargar datos para ${componentName}. Usando fallback.`,
      { error }
    );
    componentProps = getFallbackProps(componentName);
  }

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
      `Componente "${componentName}" y sus props cargados con éxito.`
    );
    logger.endGroup();

    return { ComponentToRender, componentProps, appliedTheme, entry };
  } catch (error) {
    const errorMsg = `Error crítico al importar dinámicamente el módulo para "${componentName}".`;
    logger.error(errorMsg, { path: entry.componentPath, error });
    logger.endGroup();
    throw new Error(
      `No se pudo cargar el módulo del componente: ${entry.componentPath}`
    );
  }
}
