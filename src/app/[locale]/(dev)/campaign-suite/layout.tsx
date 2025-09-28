// RUTA: src/app/[locale]/(dev)/campaign-suite/layout.tsx
/**
 * @file layout.tsx
 * @description Layout de Servidor para la SDC. Obtiene todos los datos
 *              necesarios (i18n, fragmentos) y los delega al cliente.
 * @version 9.0.0 (Holistic Data Flow Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { notFound } from "next/navigation";
import { CampaignSuiteWizard } from "@/components/features/campaign-suite";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { loadAllThemeFragmentsAction } from "@/shared/lib/actions/campaign-suite";

interface WizardLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function WizardLayout({
  children,
  params: { locale },
}: WizardLayoutProps) {
  logger.info(
    `[SDC DevLayout] Ensamblando Wizard para locale: ${locale} (v9.0)`
  );

  const [dictionaryResult, fragmentsResult] = await Promise.all([
    getDictionary(locale),
    loadAllThemeFragmentsAction(),
  ]);

  const { dictionary, error } = dictionaryResult;
  const pageContent = dictionary.campaignSuitePage;

  if (error || !pageContent) {
    const errorMessage = "Fallo al cargar el contenido i18n para la SDC.";
    if (process.env.NODE_ENV === "production") return notFound();
    return (
      <DeveloperErrorDisplay
        context="WizardLayout (dev)"
        errorMessage={errorMessage}
        errorDetails={error}
      />
    );
  }

  if (!fragmentsResult.success) {
    return (
      <DeveloperErrorDisplay
        context="WizardLayout (dev)"
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
// RUTA: src/app/[locale]/(dev)/campaign-suite/layout.tsx
