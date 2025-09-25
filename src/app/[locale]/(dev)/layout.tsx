// RUTA: src/app/[locale]/(dev)/layout.tsx
/**
 * @file layout.tsx
 * @description Layout raíz para el DCC, con arquitectura de datos atómica,
 *              resiliente y con rutas de importación soberanas.
 * @version 9.0.0 (FSD Path Realignment)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import AppProviders from "@/components/layout/AppProviders";
import DevHeader from "@/components/dev/DevHeader";
import { Container } from "@/components/ui/Container";
// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
// Se corrige la importación para apuntar a la SSoT del componente en la capa de features.
import { WizardHeader } from "@/components/features/campaign-suite/_components/WizardHeader";
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---
import { DeveloperErrorDisplay } from "@/components/dev";
import { getThemeFragmentsAction } from "@/shared/lib/actions/campaign-suite/getThemeFragments.action";
import { DevThemeSwitcher } from "@/components/dev";
import { loadEdgeJsonAsset } from "@/shared/lib/i18n/i18n.edge";
import type { AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";
import type { DiscoveredFragments } from "@/shared/lib/actions/campaign-suite/getThemeFragments.action";
import type { ActionResult } from "@/shared/lib/types/actions.types";

interface DevLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function DevLayout({
  children,
  params: { locale },
}: DevLayoutProps) {
  logger.info(
    `[DevLayout] Renderizando layout raíz del DCC v9.0 para locale: [${locale}]`
  );

  const { dictionary, error } = await getDictionary(locale);

  if (
    error ||
    !dictionary.devHeader ||
    !dictionary.devRouteMenu ||
    !dictionary.devDashboardPage ||
    !dictionary.suiteStyleComposer ||
    !dictionary.cookieConsentBanner ||
    !dictionary.toggleTheme ||
    !dictionary.languageSwitcher ||
    !dictionary.cart
  ) {
    const errorMessage =
      "Diccionario esencial para el DCC no cargado o incompleto.";
    logger.error(`[DevLayout] ${errorMessage}`, { error });
    if (process.env.NODE_ENV === "production") {
      return notFound();
    }
    return (
      <html lang={locale}>
        <body>
          <DeveloperErrorDisplay
            context="DevLayout"
            errorMessage={errorMessage}
            errorDetails={error}
          />
        </body>
      </html>
    );
  }

  const pathname = headers().get("x-next-pathname") || "";
  const isCampaignSuite = pathname.includes("/creator/campaign-suite");

  const fragmentsResult: ActionResult<DiscoveredFragments> =
    await getThemeFragmentsAction();

  const allLoadedFragments: {
    base: Partial<AssembledTheme>;
    colors: Record<string, Partial<AssembledTheme>>;
    fonts: Record<string, Partial<AssembledTheme>>;
    radii: Record<string, Partial<AssembledTheme>>;
  } = {
    base: {},
    colors: {},
    fonts: {},
    radii: {},
  };

  if (fragmentsResult.success) {
    const { colors = [], fonts = [], radii = [] } = fragmentsResult.data;
    const [base, loadedColors, loadedFonts, loadedRadii] = await Promise.all([
      loadEdgeJsonAsset<Partial<AssembledTheme>>(
        "theme-fragments",
        "base",
        "global.theme.json"
      ).catch(() => ({})),
      Promise.all(
        colors.map((name) =>
          loadEdgeJsonAsset<Partial<AssembledTheme>>(
            "theme-fragments",
            "colors",
            `${name}.colors.json`
          )
            .then((data) => ({ name, data }))
            .catch(() => null)
        )
      ),
      Promise.all(
        fonts.map((name) =>
          loadEdgeJsonAsset<Partial<AssembledTheme>>(
            "theme-fragments",
            "fonts",
            `${name}.fonts.json`
          )
            .then((data) => ({ name, data }))
            .catch(() => null)
        )
      ),
      Promise.all(
        radii.map((name) =>
          loadEdgeJsonAsset<Partial<AssembledTheme>>(
            "theme-fragments",
            "radii",
            `${name}.radii.json`
          )
            .then((data) => ({ name, data }))
            .catch(() => null)
        )
      ),
    ]);
    allLoadedFragments.base = base;
    allLoadedFragments.colors = Object.fromEntries(
      loadedColors.filter(Boolean).map((item) => [item!.name, item!.data])
    );
    allLoadedFragments.fonts = Object.fromEntries(
      loadedFonts.filter(Boolean).map((item) => [item!.name, item!.data])
    );
    allLoadedFragments.radii = Object.fromEntries(
      loadedRadii.filter(Boolean).map((item) => [item!.name, item!.data])
    );
  } else {
    logger.error("[DevLayout] Fallo al obtener fragmentos de tema globales.", {
      error: fragmentsResult.error,
    });
  }

  const devSwitcherContent = dictionary.suiteStyleComposer;

  return (
    <AppProviders
      locale={locale}
      cookieConsentContent={dictionary.cookieConsentBanner}
    >
      <DevHeader
        locale={locale}
        centerComponent={isCampaignSuite ? <WizardHeader /> : null}
        devThemeSwitcher={
          <DevThemeSwitcher
            allThemeFragments={allLoadedFragments}
            content={devSwitcherContent}
          />
        }
        content={dictionary.devHeader}
        devMenuContent={dictionary.devRouteMenu}
        toggleThemeContent={dictionary.toggleTheme}
        languageSwitcherContent={dictionary.languageSwitcher}
      />
      <main className="py-8 md:py-12">
        <Container>{children}</Container>
      </main>
    </AppProviders>
  );
}
