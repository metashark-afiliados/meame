// RUTA: src/components/features/campaign-suite/CampaignSuiteWizard.tsx
/**
 * @file CampaignSuiteWizard.tsx
 * @description Orquestador de cliente principal ("cerebro") para la SDC.
 *              v1.2.0 (Architectural Realignment): Se corrige la ruta de
 *              importación de DeveloperErrorDisplay para alinearse con la
 *              nueva Arquitectura Canónica Soberana (ACS), resolviendo un
 *              error crítico de build TS2304.
 * @version 1.2.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { logger } from "@/shared/lib/logging";
import { stepsConfig } from "@/shared/lib/config/campaign-suite/wizard.config";
import {
  useCampaignDraftContext,
  useDraftMetadataStore,
} from "@/shared/hooks/campaign-suite";
import { WizardProvider } from "./_context/WizardContext";
import { ProgressContext, type ProgressStep } from "./_context/ProgressContext";
import { WizardClientLayout } from "./_components";
// --- [INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
// La importación ahora apunta a la SSoT canónica en la capa de 'features'.
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";
// --- [FIN DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

interface CampaignSuiteWizardProps {
  children: React.ReactNode;
  content: NonNullable<Dictionary["campaignSuitePage"]>;
}

export function CampaignSuiteWizard({
  children,
  content,
}: CampaignSuiteWizardProps): React.ReactElement {
  logger.info("[CampaignSuiteWizard] Renderizando orquestador v1.2.0.");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { initializeDraft, isLoading } = useCampaignDraftContext();
  const { completedSteps } = useDraftMetadataStore();

  useEffect(() => {
    initializeDraft();
  }, [initializeDraft]);

  const currentStepId = useMemo(() => {
    const stepParam = searchParams.get("step");
    return stepParam ? parseInt(stepParam, 10) : 0;
  }, [searchParams]);

  const handleNavigation = useCallback(
    (newStepId: number) => {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("step", String(newStepId));
      router.push(`?${newParams.toString()}`);
    },
    [router, searchParams]
  );

  const handleNextStep = useCallback(() => {
    if (currentStepId < stepsConfig.length - 1) {
      handleNavigation(currentStepId + 1);
    }
  }, [currentStepId, handleNavigation]);

  const handlePrevStep = useCallback(() => {
    if (currentStepId > 0) {
      handleNavigation(currentStepId - 1);
    }
  }, [currentStepId, handleNavigation]);

  const handleStepClick = useCallback(
    (stepId: number) => {
      if (
        completedSteps.includes(stepId) ||
        stepId === currentStepId ||
        completedSteps.includes(stepId - 1)
      ) {
        handleNavigation(stepId);
      }
    },
    [completedSteps, currentStepId, handleNavigation]
  );

  const wizardContextValue = useMemo(
    () => ({ goToNextStep: handleNextStep, goToPrevStep: handlePrevStep }),
    [handleNextStep, handlePrevStep]
  );

  const progressSteps: ProgressStep[] = useMemo(() => {
    return stepsConfig.map((step) => ({
      id: step.id,
      title: content.stepper
        ? content.stepper[step.titleKey as keyof typeof content.stepper]
        : step.titleKey,
      status:
        step.id === currentStepId
          ? "active"
          : completedSteps.includes(step.id)
            ? "completed"
            : "pending",
    }));
  }, [currentStepId, completedSteps, content]);

  const progressContextValue = useMemo(
    () => ({ steps: progressSteps, onStepClick: handleStepClick }),
    [progressSteps, handleStepClick]
  );

  if (!content.preview) {
    const errorMessage = "Contrato i18n para 'campaignSuitePage' incompleto.";
    return (
      <DeveloperErrorDisplay
        context="CampaignSuiteWizard"
        errorMessage={errorMessage}
      />
    );
  }

  return (
    <WizardProvider value={wizardContextValue}>
      <ProgressContext.Provider value={progressContextValue}>
        <WizardClientLayout
          previewContent={content.preview}
          isLoadingDraft={isLoading}
        >
          {children}
        </WizardClientLayout>
      </ProgressContext.Provider>
    </WizardProvider>
  );
}
