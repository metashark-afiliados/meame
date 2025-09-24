// RUTA: app/[locale]/(dev)/dev/test-page/page.tsx

/**
 * @file page.tsx
 * @description Página de servidor para la Vitrina de Resiliencia. Orquesta la
 *              carga de todos los datos necesarios (diccionarios, temas, componentes)
 *              y los pasa al componente de cliente para su renderizado interactivo.
 * @version 9.0.0 (Holistic Refactor & MEA Prep)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import {
  getCampaignData,
  resolveCampaignVariant,
} from "@/shared/lib/i18n/campaign.i18n";
import {
  getAllCampaignsAndVariants,
  type CampaignVariantInfo, // <-- TIPO IMPORTADO
} from "@/shared/lib/dev/campaign-utils"; // <-- RUTA CORREGIDA
import { loadJsonAsset } from "@/shared/lib/i18n/campaign.data.loader";
import {
  AssembledThemeSchema,
  type AssembledTheme,
} from "@/shared/lib/schemas/theming/assembled-theme.schema";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import TestPageClient from "./_components/TestPageClient";
import { ZodError } from "zod";
import { deepMerge } from "@/shared/lib/utils";
import { parseThemeNetString } from "@/shared/lib/theming/theme-utils"; // <-- RUTA CORREGIDA
import { netTracePrefixToPathMap } from "@/shared/lib/config/theming.config";
import type { AvailableTheme } from "./_types/themes.types";
import { DeveloperErrorDisplay } from "@/components/dev";

interface DevTestPageProps {
  params: { locale: Locale };
}

export default async function DevTestPage({
  params: { locale },
}: DevTestPageProps): Promise<React.ReactElement> {
  logger.startGroup(
    "Vitrina de Componentes v9.0: Fase de Carga de Datos (Servidor)"
  );
  let validationError: ZodError | Error | null = null;
  try {
    const [{ dictionary: globalDictionary, error: dictError }, campaignData] =
      await Promise.all([
        getDictionary(locale),
        getCampaignData("12157", locale, "02"),
      ]);
    validationError = dictError;
    if (dictError)
      throw new Error("Fallo en la validación del diccionario global.");
    const masterDictionary = {
      ...globalDictionary,
      ...campaignData.dictionary,
    };
    logger.success("Diccionario Maestro ensamblado con éxito.");
    const campaignVariants = await getAllCampaignsAndVariants();
    const baseTheme = await loadJsonAsset<Partial<AssembledTheme>>(
      "theme-fragments",
      "base",
      "global.theme.json"
    );
    const themePromises = campaignVariants.map(
      // --- [INICIO DE CORRECCIÓN DE TIPO] ---
      async (variantInfo: CampaignVariantInfo) => {
        // --- [FIN DE CORRECCIÓN DE TIPO] ---
        try {
          const { variant } = await resolveCampaignVariant(
            variantInfo.campaignId,
            variantInfo.variantId
          );
          const themePlan = parseThemeNetString(variant.theme);
          const fragmentPromises = Object.entries(themePlan).map(
            ([prefix, name]) => {
              const dir =
                netTracePrefixToPathMap[
                  prefix as keyof typeof netTracePrefixToPathMap
                ];
              if (!dir) return Promise.resolve({});
              return loadJsonAsset<Partial<AssembledTheme>>(
                "theme-fragments",
                dir,
                `${name}.${dir}.json`
              );
            }
          );
          const themeFragments = await Promise.all(fragmentPromises);
          let finalTheme: AssembledTheme = baseTheme as AssembledTheme;
          for (const fragment of themeFragments) {
            finalTheme = deepMerge(finalTheme, fragment as AssembledTheme);
          }
          finalTheme = deepMerge(
            finalTheme,
            (variant.themeOverrides ?? {}) as AssembledTheme
          );
          const validation = AssembledThemeSchema.safeParse(finalTheme);
          if (validation.success) {
            return {
              id: variantInfo.variantId,
              name: variantInfo.name,
              themeData: validation.data,
            };
          }
        } catch (e) {
          logger.warn(`No se pudo cargar el tema para ${variantInfo.name}`, {
            e,
          });
        }
        return null;
      }
    );
    const availableThemes = (await Promise.all(themePromises)).filter(
      Boolean
    ) as AvailableTheme[];
    logger.success(`${availableThemes.length} temas de campaña cargados.`);
    return (
      <TestPageClient
        locale={locale}
        masterDictionary={masterDictionary as Dictionary}
        availableThemes={availableThemes}
      />
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      "Fallo crítico al cargar datos para la Vitrina de Componentes",
      { error: errorMessage }
    );
    return (
      <DeveloperErrorDisplay
        context="DevTestPage"
        errorMessage={errorMessage}
        errorDetails={validationError}
      />
    );
  } finally {
    logger.endGroup();
  }
}
