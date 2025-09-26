// RUTA: src/app/[locale]/creator/campaign-suite/[[...stepId]]/page.tsx
/**
 * @file page.tsx
 * @description Punto de entrada SOBERANO y UNIFICADO para la SDC.
 *              v13.0.0 (Routing Conflict Resolution): Resuelve el error de build
 *              al unificar la lógica de la lobby y de los pasos del wizard.
 * @version 13.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { notFound } from "next/navigation";
import { logger } from "@/shared/lib/logging";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { stepsConfig } from "@/shared/lib/config/campaign-suite/wizard.config";
import { getDictionary } from "@/shared/lib/i18n/i18n";

// --- [INICIO DE REFACTORIZACIÓN SOBERANA] ---
// Se importan los aparatos necesarios para la lógica de la "lobby".
import { getCampaignTemplatesAction } from "@/shared/lib/actions/campaign-suite";
import { TemplateBrowser } from "@/components/features/campaign-suite/TemplateBrowser";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { StepClientWrapper } from "@/components/features/campaign-suite/_components";
// --- [FIN DE REFACTORIZACIÓN SOBERANA] ---

interface CampaignStepPageProps {
  params: { locale: Locale; stepId?: string[] };
}

export default async function CampaignStepPage({
  params: { locale, stepId },
}: CampaignStepPageProps) {
  const isLobbyView = !stepId || stepId.length === 0;

  if (isLobbyView) {
    // --- LÓGICA DE LA LOBBY (ANTERIORMENTE EN EL ARCHIVO ELIMINADO) ---
    logger.info(
      "[SDC Entry Point] Renderizando vista de Lobby (Template Browser)."
    );
    const templatesResult = await getCampaignTemplatesAction();

    if (!templatesResult.success) {
      return (
        <DeveloperErrorDisplay
          context="CampaignSuiteLobby"
          errorMessage="No se pudieron cargar las plantillas de campaña."
          errorDetails={templatesResult.error}
        />
      );
    }
    return <TemplateBrowser templates={templatesResult.data} />;
  } else {
    // --- LÓGICA DE LOS PASOS DEL WIZARD (EXISTENTE) ---
    const currentStepId = parseInt(stepId[0], 10);
    logger.info(`[SDC Entry Point] Renderizando Step ${currentStepId}.`);
    const stepConfig = stepsConfig.find((s) => s.id === currentStepId);

    if (!stepConfig) {
      logger.error(
        `[StepPage] Config no encontrada para paso ${currentStepId}.`
      );
      return notFound();
    }

    const { dictionary } = await getDictionary(locale);
    const stepContent = dictionary[stepConfig.i18nKey];

    if (!stepContent) {
      logger.error(`Contenido para ${stepConfig.i18nKey} no encontrado.`);
      return <div>Error: Contenido del paso no encontrado.</div>;
    }

    return <StepClientWrapper stepContent={stepContent} />;
  }
}
