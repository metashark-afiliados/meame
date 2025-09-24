// RUTA: app/[locale]/creator/campaign-suite/[[...stepId]]/page.tsx
/**
 * @file page.tsx
 * @description Punto de entrada para la ruta de la SDC.
 * @version 3.0.0 (FSD Architecture Alignment)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { getDictionary } from "@/shared/lib/i18n/get-dictionary";
import type { Locale } from "@/shared/lib/i18n/i18n.config";

// ANTERIOR: import { CampaignSuiteWizard } from "../_components/CampaignSuiteWizard"; (ruta relativa compleja)
// NUEVO: Importa el componente principal de la feature desde su ubicación canónica.
import { CampaignSuiteWizard } from "@/components/features/campaign-suite/CampaignSuiteWizard";

interface CampaignSuitePageProps {
  params: { locale: Locale };
}

export default async function CampaignSuitePage({
  params: { locale },
}: CampaignSuitePageProps): Promise<React.ReactElement> {
  const dictionary = await getDictionary(locale);
  const pageContent = dictionary.campaignSuitePage;

  return <CampaignSuiteWizard locale={locale} content={pageContent} />;
}
