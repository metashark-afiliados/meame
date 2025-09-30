// RUTA: src/components/features/campaign-suite/CampaignSuiteWizard.tsx
/**
 * @file CampaignSuiteWizard.tsx
 * @description Orquestador de cliente principal ("cerebro") para la SDC, con observabilidad de élite.
 * @version 17.0.0 (Elite Observability & Full Compliance)
 * @author L.I.A. Legacy
 */
"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { logger } from "@/shared/lib/logging";
import { stepsConfig } from "@/shared/lib/config/campaign-suite/wizard.config";
import {
  useCampaignDraftStore,
  useDraftMetadataStore,
} from "@/shared/hooks/campaign-suite";
import { WizardProvider } from "./_context/WizardContext";
import { ProgressContext, type ProgressStep } from "./_context/ProgressContext";
import { WizardClientLayout } from "./_components/WizardClientLayout";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { LoadedFragments } from "@/shared/lib/actions/campaign-suite";

interface CampaignSuiteWizardProps {
  children: React.ReactNode;
  content: NonNullable<Dictionary["campaignSuitePage"]>;
  loadedFragments: LoadedFragments;
}

export function CampaignSuiteWizard({
  children,
  content,
  loadedFragments,
}: CampaignSuiteWizardProps): React.ReactElement {
  // --- INICIO: PILAR III (FULL OBSERVABILIDAD) ---
  logger.info("[Observabilidad][CLIENTE] Renderizando CampaignSuiteWizard v17.0.");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { initializeDraft, isLoading } = useCampaignDraftStore();
  const { completedSteps } = useDraftMetadataStore();

  useEffect(() => {
    // La inicialización del borrador se registra en el propio store.
    initializeDraft();
  }, [initializeDraft]);

  const currentStepId = useMemo(() => {
    const stepParam = searchParams.get("step");
    return stepParam ? parseInt(stepParam, 10) : 0;
  }, [searchParams]);

  const handleNavigation = useCallback(
    (newStepId: number) => {
      logger.trace(`[Wizard] Navegando al paso ${newStepId}.`);
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
      } else {
        logger.warn(`[Wizard] Intento de saltar a un paso no completado (${stepId}). Acción denegada.`);
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

  return (
    <WizardProvider value={wizardContextValue}>
      <ProgressContext.Provider value={progressContextValue}>
        <WizardClientLayout
          previewContent={content.preview!}
          isLoadingDraft={isLoading}
          loadedFragments={loadedFragments}
        >
          {children}
        </WizardClientLayout>
      </ProgressContext.Provider>
    </WizardProvider>
  );
}
