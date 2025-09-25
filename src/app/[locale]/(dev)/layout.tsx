// RUTA: src/app/[locale]/(dev)/layout.tsx
/**
 * @file layout.tsx
 * @description Layout de Servidor para el DCC, ahora un Guardián de Datos resiliente.
 *              v10.0.0 (Holistic Refactor & Contract Guardian): Resuelve una cascada
 *              de errores de tipo y de importación. Implementa un manejo de errores
 *              robusto que garantiza que el componente de cliente siempre reciba un
 *              contrato de datos completo y válido.
 * @version 10.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { DevLayoutClient } from "./DevLayoutClient";
import { DeveloperErrorDisplay } from "@/components/dev";
// --- [INICIO DE CORRECCIÓN DE HIGIENE Y API] ---
// Se corrige el nombre de la función importada (TS2724)
import { getThemeFragmentsAction } from "@/shared/lib/actions/campaign-suite/getThemeFragments.action";
// --- [FIN DE CORRECCIÓN DE HIGIENE Y API] ---
import { loadJsonAsset } from "@/shared/lib/i18n/campaign.data.loader";
import { type AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";
import type { LoadedFragments } from "@/components/features/dev-tools/SuiteStyleComposer/types";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

interface DevLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function DevLayout({ children, params }: DevLayoutProps) {
  logger.info(
    "[DevLayout] Renderizando layout de DCC v10.0 (Contract Guardian)."
  );

  try {
    const { dictionary, error: dictError } = await getDictionary(params.locale);

    // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA (TS2322)] ---
    // Guardia de Contrato Estricta: se verifica la existencia de todas las
    // claves de primer nivel que el DevLayoutClient necesita.
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
    // A partir de aquí, TypeScript sabe que `dictionary` es un objeto completo y no parcial.
    // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA (TS2322)] ---

    const fragmentsResult = await getThemeFragmentsAction();
    if (!fragmentsResult.success) {
      throw new Error(fragmentsResult.error);
    }
    const fragments = fragmentsResult.data;

    // Carga de todos los fragmentos en paralelo con tipado explícito
    const [base, colors, fonts, radii] = await Promise.all([
      loadJsonAsset<Partial<AssembledTheme>>(
        "theme-fragments",
        "base",
        "global.theme.json"
      ),
      // --- [INICIO DE CORRECCIÓN DE TIPO (TS7006)] ---
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
      // --- [FIN DE CORRECCIÓN DE TIPO (TS7006)] ---
    ]);

    const allLoadedFragments: LoadedFragments = {
      base,
      // --- [INICIO DE CORRECCIÓN DE TIPO (TS7006)] ---
      colors: Object.fromEntries(
        colors.map((c: { name: string; data: Partial<AssembledTheme> }) => [
          c.name,
          c.data,
        ])
      ),
      fonts: Object.fromEntries(
        fonts.map((f: { name: string; data: Partial<AssembledTheme> }) => [
          f.name,
          f.data,
        ])
      ),
      radii: Object.fromEntries(
        radii.map((r: { name: string; data: Partial<AssembledTheme> }) => [
          r.name,
          r.data,
        ])
      ),
      // --- [FIN DE CORRECCIÓN DE TIPO (TS7006)] ---
    };

    return (
      <DevLayoutClient
        locale={params.locale}
        dictionary={dictionary as Dictionary} // Aserción segura gracias a la guardia
        allLoadedFragments={allLoadedFragments}
      >
        {children}
      </DevLayoutClient>
    );
  } catch (error) {
    const errorMessage =
      "Fallo crítico al renderizar el layout del Developer Command Center.";
    logger.error(`[DevLayout] ${errorMessage}`, { error });

    if (process.env.NODE_ENV === "development") {
      return (
        <DeveloperErrorDisplay
          context="DevLayout"
          errorMessage={errorMessage}
          errorDetails={error instanceof Error ? error : String(error)}
        />
      );
    }

    return notFound();
  }
}
