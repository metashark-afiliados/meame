// RUTA: src/app/[locale]/creator/campaign-suite/[[...stepId]]/layout.tsx
/**
 * @file layout.tsx
 * @description Layout orquestador para la SDC. Obtiene todos los datos de
 *              servidor (i18n y fragmentos de tema) y los delega al cliente.
 * @version 5.0.0 (Server-Side Data Hydration)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { CampaignSuiteWizard } from "@/components/features/campaign-suite/CampaignSuiteWizard";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { loadAllThemeFragmentsAction } from "@/shared/lib/actions/campaign-suite";

interface CampaignSuiteLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function CampaignSuiteLayout({
  children,
  params: { locale },
}: CampaignSuiteLayoutProps) {
  logger.info(`[SDC Layout] Ensamblando Wizard para locale: ${locale} (v5.0)`);

  const [dictionaryResult, fragmentsResult] = await Promise.all([
    getDictionary(locale),
    loadAllThemeFragmentsAction(),
  ]);

  const { dictionary, error } = dictionaryResult;
  const pageContent = dictionary.campaignSuitePage;

  if (error || !pageContent) {
    return (
      <DeveloperErrorDisplay
        context="CampaignSuiteLayout"
        errorMessage="Fallo al cargar el diccionario para la SDC."
        errorDetails={error}
      />
    );
  }

  if (!fragmentsResult.success) {
    return (
      <DeveloperErrorDisplay
        context="CampaignSuiteLayout"
        errorMessage="Fallo al cargar los fragmentos de tema."
        errorDetails={fragmentsResult.error}
      />
    );
  }

  return (
    <CampaignSuiteWizard
      content={pageContent}
      loadedFragments={fragmentsResult.data}
    >
      {children}
    </CampaignSuiteWizard>
  );
}
// RUTA: src/app/[locale]/creator/campaign-suite/[[...stepId]]/layout.tsx
