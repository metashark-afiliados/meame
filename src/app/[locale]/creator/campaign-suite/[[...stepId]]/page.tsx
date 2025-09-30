// RUTA: src/app/[locale]/creator/campaign-suite/[[...stepId]]/page.tsx
/**
 * @file page.tsx
 * @description Punto de entrada SOBERANO y UNIFICADO para la SDC.
 *              v14.0.0 (Sovereign Client Data Fetching): Se adhiere al patrón
 *              "Server Shell", delegando la obtención de datos dependientes
 *              del cliente al componente `TemplateBrowser`.
 * @version 14.0.0
 * @author L.I.A. Legacy
 */
import React from "react";
import { notFound } from "next/navigation";
import { logger } from "@/shared/lib/logging";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { stepsConfig } from "@/shared/lib/config/campaign-suite/wizard.config";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { TemplateBrowser } from "@/components/features/campaign-suite/TemplateBrowser";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { StepClientWrapper } from "@/components/features/campaign-suite/_components";

interface CampaignStepPageProps {
  params: { locale: Locale; stepId?: string[] };
}

export default async function CampaignStepPage({
  params: { locale, stepId },
}: CampaignStepPageProps) {
  const traceId = logger.startTrace("CampaignStepPage_v14.0");
  const isLobbyView = !stepId || stepId.length === 0;

  if (isLobbyView) {
    logger.info("[SDC Entry Point] Renderizando vista de Lobby (Server Shell).", { traceId });
    // El Server Component ahora solo renderiza el Client Component,
    // que se encargará de obtener sus propias plantillas.
    return <TemplateBrowser />;
  } else {
    const currentStepId = parseInt(stepId[0], 10);
    logger.info(`[SDC Entry Point] Renderizando Step ${currentStepId}.`, { traceId });
    const stepConfig = stepsConfig.find((s) => s.id === currentStepId);

    if (!stepConfig) {
      logger.error(`[StepPage] Config no encontrada para paso ${currentStepId}.`, { traceId });
      return notFound();
    }

    const { dictionary, error } = await getDictionary(locale);
    const stepContent = dictionary[stepConfig.i18nKey];

    if (error || !stepContent) {
      const errorMessage = `No se pudo cargar o validar el contenido para el paso ${currentStepId}.`;
      logger.error(`[StepPage] ${errorMessage}`, { error, traceId });
      return (
        <DeveloperErrorDisplay
          context="CampaignStepPage"
          errorMessage={errorMessage}
          errorDetails={error || `La clave i18n '${stepConfig.i18nKey}' falta en el diccionario.`}
        />
      );
    }

    logger.endTrace(traceId);
    return <StepClientWrapper stepContent={stepContent} />;
  }
}
