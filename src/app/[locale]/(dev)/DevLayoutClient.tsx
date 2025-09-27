// RUTA: src/app/[locale]/(dev)/DevLayoutClient.tsx
/**
 * @file DevLayoutClient.tsx
 * @description Límite de Cliente para el Layout del DCC. Orquesta los
 *              proveedores, el header y los efectos de MEA/UX, y ahora cumple
 *              con la Arquitectura Canónica Soberana.
 * @version 3.0.0 (Sovereign Path Restoration & ACS Compliance)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AppProviders from "@/components/layout/AppProviders";
// --- [INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
// Se corrigen las importaciones para apuntar a la SSoT canónica en la capa de features.
import DevHeader from "@/components/features/dev-tools/DevHeader";
import { DevThemeSwitcher } from "@/components/features/dev-tools/DevThemeSwitcher";
// --- [FIN DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
import { Container } from "@/components/ui/Container";
import { WizardHeader } from "@/components/features/campaign-suite/_components/WizardHeader";
import { useCelebrationStore } from "@/shared/lib/stores/use-celebration.store";
import { DigitalConfetti } from "@/components/ui/DigitalConfetti";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { LoadedFragments } from "@/components/features/dev-tools/SuiteStyleComposer/types";
import { logger } from "@/shared/lib/logging";

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
    `[DevLayoutClient] Hidratando layout del DCC v3.0 (ACS Compliant)`
  );

  const { isCelebrating, endCelebration } = useCelebrationStore();
  const pathname = usePathname();
  const isCampaignSuite = pathname.includes("/creator/campaign-suite");

  // Guardia de resiliencia para el contenido, asegurando que las claves existan.
  const devHeaderContent = dictionary.devHeader;
  const devMenuContent = dictionary.devRouteMenu;
  const toggleThemeContent = dictionary.toggleTheme;
  const languageSwitcherContent = dictionary.languageSwitcher;
  const suiteStyleComposerContent = dictionary.suiteStyleComposer;
  const cookieConsentContent = dictionary.cookieConsentBanner;

  if (
    !devHeaderContent ||
    !devMenuContent ||
    !toggleThemeContent ||
    !languageSwitcherContent ||
    !suiteStyleComposerContent ||
    !cookieConsentContent
  ) {
    // En un caso real, un componente de error más elegante sería ideal aquí.
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
// RUTA: src/app/[locale]/(dev)/DevLayoutClient.tsx
