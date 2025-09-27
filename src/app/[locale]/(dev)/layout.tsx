// RUTA: src/app/[locale]/(dev)/layout.tsx
/**
 * @file layout.tsx
 * @description Layout de Servidor para el DCC, ahora un Guardián de Datos
 *              resiliente y con observabilidad de élite para depuración.
 * @version 12.0.0 (Armored with Elite Observability & Resilience)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { DevLayoutClient } from "./DevLayoutClient";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { getThemeFragmentsAction } from "@/shared/lib/actions/campaign-suite/getThemeFragments.action";
import { loadJsonAsset } from "@/shared/lib/i18n/campaign.data.loader";
import { type AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";
import type { LoadedFragments } from "@/components/features/dev-tools/SuiteStyleComposer/types";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

interface DevLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function DevLayout({ children, params }: DevLayoutProps) {
  const traceId = logger.startTrace("DevLayout_Render_v12.0_Armored");
  logger.info(
    `[DevLayout] Renderizando layout de DCC v12.0 (Armored) para locale: ${params.locale}`,
    { traceId }
  );

  // --- [INICIO DE BLINDAJE DE RESILIENCIA] ---
  try {
    logger.traceEvent(traceId, "Obteniendo diccionario...");
    const { dictionary, error: dictError } = await getDictionary(params.locale);

    if (
      dictError ||
      !dictionary.devHeader ||
      !dictionary.devRouteMenu ||
      !dictionary.toggleTheme ||
      !dictionary.languageSwitcher ||
      !dictionary.suiteStyleComposer
    ) {
      throw new Error(
        "Faltan claves de contenido i18n críticas para el layout del DCC."
      );
    }
    logger.traceEvent(traceId, "Diccionario obtenido y validado.");

    logger.traceEvent(traceId, "Obteniendo lista de fragmentos de tema...");
    const fragmentsResult = await getThemeFragmentsAction();
    if (!fragmentsResult.success) {
      throw new Error(fragmentsResult.error);
    }
    const fragments = fragmentsResult.data;
    logger.traceEvent(traceId, "Lista de fragmentos obtenida.");

    logger.traceEvent(
      traceId,
      "Cargando todos los archivos de fragmentos JSON en paralelo..."
    );
    const [base, colors, fonts, radii] = await Promise.all([
      loadJsonAsset<Partial<AssembledTheme>>(
        "theme-fragments",
        "base",
        "global.theme.json"
      ),
      Promise.all(
        fragments.colors.map((name: string) =>
          loadJsonAsset<Partial<AssembledTheme>>(
            "theme-fragments",
            "colors",
            `${name}.colors.json`
          ).then((data) => ({ name, data }))
        )
      ),
      Promise.all(
        fragments.fonts.map((name: string) =>
          loadJsonAsset<Partial<AssembledTheme>>(
            "theme-fragments",
            "fonts",
            `${name}.fonts.json`
          ).then((data) => ({ name, data }))
        )
      ),
      Promise.all(
        fragments.radii.map((name: string) =>
          loadJsonAsset<Partial<AssembledTheme>>(
            "theme-fragments",
            "radii",
            `${name}.radii.json`
          ).then((data) => ({ name, data }))
        )
      ),
    ]);
    logger.traceEvent(traceId, "Todos los fragmentos JSON cargados.");

    const allLoadedFragments: LoadedFragments = {
      base,
      colors: Object.fromEntries(colors.map((c) => [c.name, c.data])),
      fonts: Object.fromEntries(fonts.map((f) => [f.name, f.data])),
      radii: Object.fromEntries(radii.map((r) => [r.name, r.data])),
    };
    logger.traceEvent(traceId, "Objeto de fragmentos ensamblado.");

    logger.success("[DevLayout] Todos los datos cargados con éxito.", {
      traceId,
    });
    logger.endTrace(traceId);

    return (
      <DevLayoutClient
        locale={params.locale}
        dictionary={dictionary as Dictionary}
        allLoadedFragments={allLoadedFragments}
      >
        {children}
      </DevLayoutClient>
    );
  } catch (error) {
    const errorMessage =
      "Fallo crítico al renderizar el layout del Developer Command Center.";
    logger.error(`[DevLayout] ${errorMessage}`, { error, traceId });
    logger.endTrace(traceId);

    if (process.env.NODE_ENV === "development") {
      return (
        <DeveloperErrorDisplay
          context="DevLayout (Armored v12.0)"
          errorMessage={errorMessage}
          errorDetails={error instanceof Error ? error : String(error)}
        />
      );
    }
    return notFound();
  }
  // --- [FIN DE BLINDAJE DE RESILIENCIA] ---
}
