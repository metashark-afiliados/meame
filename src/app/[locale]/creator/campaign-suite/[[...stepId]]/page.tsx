// RUTA: src/app/[locale]/creator/campaign-suite/[[...stepId]]/page.tsx
/**
 * @file page.tsx
 * @description Punto de entrada y cargador de datos para cada paso de la SDC.
 * @version 12.0.0 (Holistic Refactor)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { notFound } from "next/navigation";
import { logger } from "@/shared/lib/logging";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { StepClientWrapper } from "@/components/features/campaign-suite/_components";
import { stepsConfig } from "@/shared/lib/config/campaign-suite/wizard.config";
import { getDictionary } from "@/shared/lib/i18n/i18n"; // <-- RUTA CORREGIDA

interface CampaignStepPageProps {
  params: { locale: Locale; stepId?: string[] };
}

export default async function CampaignStepPage({
  params: { locale, stepId },
}: CampaignStepPageProps) {
  const currentStepId = stepId && stepId[0] ? parseInt(stepId[0], 10) : 0;
  const stepConfig = stepsConfig.find((s) => s.id === currentStepId);

  if (!stepConfig) {
    logger.error(`[StepPage] Config no encontrada para paso ${currentStepId}.`);
    return notFound();
  }

  const { dictionary } = await getDictionary(locale);
  const stepContent = dictionary[stepConfig.i18nKey];

  if (!stepContent) {
    // Manejar error si el contenido para el paso no se encuentra
    logger.error(`Contenido para ${stepConfig.i18nKey} no encontrado.`);
    return <div>Error: Contenido del paso no encontrado.</div>;
  }

  return <StepClientWrapper stepContent={stepContent} />;
}
