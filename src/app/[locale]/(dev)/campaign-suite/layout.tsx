// RUTA: src/app/[locale]/(dev)/campaign-suite/layout.tsx
/**
 * @file layout.tsx
 * @description Layout de Servidor para la SDC, ahora con integridad arquitectónica.
 *              v8.0.0 (Holistic Refactor & Data Flow Restoration): Refactorizado para
 *              utilizar el orquestador `CampaignSuiteWizard`, restaurando el flujo de
 *              datos de estado y resolviendo el error crítico de tipo TS2741.
 * @version 8.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { CampaignSuiteWizard } from "@/components/features/campaign-suite";

interface WizardLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function WizardLayout({
  children,
  params: { locale },
}: WizardLayoutProps) {
  logger.info(
    `[SDC DevLayout] Ensamblando Wizard para locale: ${locale} (v8.0)`
  );

  const { dictionary, error } = await getDictionary(locale);
  const pageContent = dictionary.campaignSuitePage;

  if (error || !pageContent) {
    const errorMessage = "Fallo al cargar el contenido i18n para la SDC.";
    logger.error(`[SDC DevLayout] ${errorMessage}`, { error });
    if (process.env.NODE_ENV === "production") return notFound();
    return (
      <DeveloperErrorDisplay
        context="WizardLayout (dev)"
        errorMessage={errorMessage}
        errorDetails={
          error || "La clave 'campaignSuitePage' falta en el diccionario."
        }
      />
    );
  }

  return (
    <CampaignSuiteWizard content={pageContent}>{children}</CampaignSuiteWizard>
  );
}
