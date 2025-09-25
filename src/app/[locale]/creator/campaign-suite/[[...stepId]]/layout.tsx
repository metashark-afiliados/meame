// RUTA: src/app/[locale]/creator/campaign-suite/[[...stepId]]/layout.tsx
/**
 * @file layout.tsx
 * @description Layout orquestador para la SDC. Ensambla el Wizard alrededor de la
 *              página del paso actual.
 * @version 4.0.0 (Holistic Refactor & Contract Sync)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { CampaignSuiteWizard } from "@/components/features/campaign-suite/CampaignSuiteWizard";
import { getDictionary } from "@/shared/lib/i18n/get-dictionary";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/dev";
import { notFound } from "next/navigation";

interface CampaignSuiteLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function CampaignSuiteLayout({
  children,
  params: { locale },
}: CampaignSuiteLayoutProps) {
  logger.info(`[SDC Layout] Ensamblando Wizard para locale: ${locale} (v4.0)`);

  const { dictionary, error } = await getDictionary(locale);
  const pageContent = dictionary.campaignSuitePage;

  if (error || !pageContent) {
    const errorMessage = "Fallo al cargar el contenido i18n para la SDC.";
    logger.error(`[SDC Layout] ${errorMessage}`, { error });
    if (process.env.NODE_ENV === "production") return notFound();
    return (
      <DeveloperErrorDisplay
        context="CampaignSuiteLayout"
        errorMessage={errorMessage}
        errorDetails={
          error || "La clave 'campaignSuitePage' falta en el diccionario."
        }
      />
    );
  }

  return (
    <CampaignSuiteWizard locale={locale} content={pageContent}>
      {children}
    </CampaignSuiteWizard>
  );
}
