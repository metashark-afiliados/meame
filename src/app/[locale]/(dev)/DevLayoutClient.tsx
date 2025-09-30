// RUTA: src/app/[locale]/(dev)/DevLayoutClient.tsx
/**
 * @file DevLayoutClient.tsx
 * @description Orquestador de cliente soberano para el layout del DCC, con blindaje de contrato.
 * @version 11.0.0 (Contract Guard & Elite Observability)
 * @author L.I.A. Legacy
 */
"use client";

import React from "react";
import AppProviders from "@/components/layout/AppProviders";
import { default as DCCHeader } from "@/components/features/dev-tools/DevHeader";
import { DevThemeSwitcher } from "@/components/features/dev-tools/DevThemeSwitcher";
import { Container } from "@/components/ui/Container";
import { useCelebrationStore } from "@/shared/lib/stores/use-celebration.store";
import { DigitalConfetti } from "@/components/ui/DigitalConfetti";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { LoadedFragments } from "@/components/features/dev-tools/SuiteStyleComposer/types";
import { logger } from "@/shared/lib/logging";
import { AuraTrackerInitializer } from "@/components/features/analytics/AuraTrackerInitializer";
import { useAuth } from "@/shared/hooks/use-auth";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";
import { ScrollingBanner } from "@/components/sections";

interface DevLayoutClientProps {
  children: React.ReactNode;
  locale: Locale;
  dictionary: Dictionary;
  allLoadedFragments: LoadedFragments;
}

export function DevLayoutClient({
  children,
  locale,
  dictionary,
  allLoadedFragments,
}: DevLayoutClientProps) {
  logger.info(`[Observabilidad][CLIENTE] Renderizando DevLayoutClient v11.0.`);
  const { user } = useAuth();
  const { isCelebrating, endCelebration } = useCelebrationStore();

  const {
    devHeader,
    toggleTheme,
    languageSwitcher,
    userNav,
    notificationBell,
    devLoginPage,
    suiteStyleComposer,
    cookieConsentBanner,
    scrollingBanner,
  } = dictionary;

  // --- INICIO DEL GUARDIÁN DE RESILIENCIA DE CLIENTE ---
  // Esta guardia actúa como una aserción de tipo para TypeScript.
  if (
    !devHeader ||
    !toggleTheme ||
    !languageSwitcher ||
    !userNav ||
    !notificationBell ||
    !devLoginPage ||
    !suiteStyleComposer ||
    !cookieConsentBanner ||
    !scrollingBanner
  ) {
    const errorMessage =
      "Faltan claves de contenido críticas para el layout de cliente.";
    logger.error(`[Guardián de Resiliencia] ${errorMessage}`);
    // En el cliente, mostramos un error de desarrollo claro.
    return (
      <DeveloperErrorDisplay
        context="DevLayoutClient"
        errorMessage={errorMessage}
      />
    );
  }
  // --- FIN DEL GUARDIÁN DE RESILIENCIA DE CLIENTE ---

  const headerContentBundle = {
    devHeader,
    toggleTheme,
    languageSwitcher,
    userNav,
    notificationBell,
    devLoginPage,
  };

  return (
    <AppProviders locale={locale} cookieConsentContent={cookieConsentBanner}>
      {user && <AuraTrackerInitializer scope="user" />}
      <DCCHeader
        locale={locale}
        devThemeSwitcher={
          <DevThemeSwitcher
            allThemeFragments={allLoadedFragments}
            content={suiteStyleComposer}
          />
        }
        content={headerContentBundle} // Ahora el tipo es correcto y no-nulo
      />
      <ScrollingBanner content={scrollingBanner} />
      <main className="pt-8">
        <Container>{children}</Container>
      </main>
      <DigitalConfetti isActive={isCelebrating} onComplete={endCelebration} />
    </AppProviders>
  );
}
