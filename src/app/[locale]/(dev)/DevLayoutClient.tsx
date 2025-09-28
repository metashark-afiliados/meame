// RUTA: src/app/[locale]/(dev)/DevLayoutClient.tsx
/**
 * @file DevLayoutClient.tsx
 * @description Orquestador de cliente soberano para el layout del DCC.
 *              v5.0.0 (Holistic Fusion & Production Ready): Fusiona la lógica del
 *              snapshot con las últimas refactorizaciones, implementando el
 *              tracking de actividad de usuario, gestión de tema y celebraciones.
 * @version 5.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AppProviders from "@/components/layout/AppProviders";
import DevHeader from "@/components/features/dev-tools/DevHeader";
import { DevThemeSwitcher } from "@/components/features/dev-tools/DevThemeSwitcher";
import { Container } from "@/components/ui/Container";
import { WizardHeader } from "@/components/features/campaign-suite/_components/WizardHeader";
import { useCelebrationStore } from "@/shared/lib/stores/use-celebration.store";
import { DigitalConfetti } from "@/components/ui/DigitalConfetti";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { LoadedFragments } from "@/components/features/dev-tools/SuiteStyleComposer/types";
import { logger } from "@/shared/lib/logging";
import { AuraTrackerInitializer } from "@/components/features/analytics/AuraTrackerInitializer";
import { useAuth } from "@/shared/hooks/use-auth";

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
  logger.info(
    `[DevLayoutClient] Hidratando layout del DCC v5.0 (Production Ready)`
  );

  const { user } = useAuth();
  const { isCelebrating, endCelebration } = useCelebrationStore();
  const pathname = usePathname();
  const isCampaignSuite = pathname.includes("/creator/campaign-suite");

  // Guardia de resiliencia para el contenido, asegurando que las claves existan.
  const {
    devHeader: devHeaderContent,
    devRouteMenu: devMenuContent,
    toggleTheme: toggleThemeContent,
    languageSwitcher: languageSwitcherContent,
    suiteStyleComposer: suiteStyleComposerContent,
    cookieConsentBanner: cookieConsentContent,
  } = dictionary;

  if (
    !devHeaderContent ||
    !devMenuContent ||
    !toggleThemeContent ||
    !languageSwitcherContent ||
    !suiteStyleComposerContent ||
    !cookieConsentContent
  ) {
    logger.error("[DevLayoutClient] Faltan claves de contenido i18n críticas.");
    return (
      <div className="bg-destructive text-destructive-foreground p-4">
        Error: Faltan datos de configuración para el layout de desarrollo.
        Revise los archivos i18n.
      </div>
    );
  }

  return (
    <AppProviders locale={locale} cookieConsentContent={cookieConsentContent}>
      {user && <AuraTrackerInitializer scope="user" />}

      <DevHeader
        locale={locale}
        centerComponent={isCampaignSuite ? <WizardHeader /> : null}
        devThemeSwitcher={
          <DevThemeSwitcher
            allThemeFragments={allLoadedFragments}
            content={suiteStyleComposerContent}
          />
        }
        content={devHeaderContent}
        devMenuContent={devMenuContent}
        toggleThemeContent={toggleThemeContent}
        languageSwitcherContent={languageSwitcherContent}
      />
      <main className="py-8 md:py-12">
        <Container>{children}</Container>
      </main>

      <DigitalConfetti isActive={isCelebrating} onComplete={endCelebration} />
    </AppProviders>
  );
}
