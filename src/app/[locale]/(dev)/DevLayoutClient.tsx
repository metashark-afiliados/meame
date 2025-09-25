// RUTA: src/app/[locale]/(dev)/DevLayoutClient.tsx
/**
 * @file DevLayoutClient.tsx
 * @description Límite de Cliente para el Layout del DCC. Orquesta los
 *              proveedores, el header y los efectos de MEA/UX, confiando en
 *              un contrato de datos garantizado por su padre de servidor.
 * @version 2.0.0 (Guaranteed Prop Contract)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AppProviders from "@/components/layout/AppProviders";
import DevHeader from "@/components/dev/DevHeader";
import { Container } from "@/components/ui/Container";
import { WizardHeader } from "@/components/features/campaign-suite/_components/WizardHeader";
import { DevThemeSwitcher } from "@/components/dev/DevThemeSwitcher";
import { useCelebrationStore } from "@/shared/lib/stores/use-celebration.store";
import { DigitalConfetti } from "@/components/ui/DigitalConfetti";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { LoadedFragments } from "@/components/features/dev-tools/SuiteStyleComposer/types";
import { logger } from "@/shared/lib/logging";

interface DevLayoutClientProps {
  children: React.ReactNode;
  locale: Locale;
  dictionary: Dictionary; // La prop ahora es no-opcional
  allLoadedFragments: LoadedFragments;
}

export function DevLayoutClient({
  children,
  locale,
  dictionary,
  allLoadedFragments,
}: DevLayoutClientProps) {
  logger.info(
    `[DevLayoutClient] Hidratando layout del DCC para locale: [${locale}]`
  );

  const { isCelebrating, endCelebration } = useCelebrationStore();
  const pathname = usePathname();
  const isCampaignSuite = pathname.includes("/creator/campaign-suite");

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
            content={dictionary.suiteStyleComposer!} // Aserción segura
          />
        }
        content={dictionary.devHeader!} // Aserción segura
        devMenuContent={dictionary.devRouteMenu!} // Aserción segura
        toggleThemeContent={dictionary.toggleTheme!} // Aserción segura
        languageSwitcherContent={dictionary.languageSwitcher!} // Aserción segura
      />
      <main className="py-8 md:py-12">
        <Container>{children}</Container>
      </main>
      <DigitalConfetti isActive={isCelebrating} onComplete={endCelebration} />
    </AppProviders>
  );
}
