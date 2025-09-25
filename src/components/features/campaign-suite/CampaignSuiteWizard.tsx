// RUTA: src/components/features/campaign-suite/CampaignSuiteWizard.tsx
/**
 * @file CampaignSuiteWizard.tsx
 * @description Orquestador de cliente principal ("cerebro") para la SDC.
 *              Gestiona el estado, la navegación y los proveedores de contexto,
 *              y actúa como un "guardián de contratos" para sus componentes hijos.
 * @version 2.1.0 (Type Resilience & Hygiene Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { logger } from "@/shared/lib/logging";
import { stepsConfig } from "@/shared/lib/config/campaign-suite/wizard.config";
import { useCampaignDraft } from "@/shared/hooks/campaign-suite/use-campaign-draft";
import { WizardProvider } from "./_context/WizardContext";
import { ProgressContext, type ProgressStep } from "./_context/ProgressContext";
import { validateStep1 } from "./Step1_Structure/step1.validator";
import { WizardClientLayout } from "./_components/WizardClientLayout";
import { DeveloperErrorDisplay } from "@/components/dev"; // Importar para la guardia de resiliencia
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

/**
 * @interface CampaignSuiteWizardProps
 * @description Contrato de props de élite para el orquestador del asistente.
 */
interface CampaignSuiteWizardProps {
  children: React.ReactNode;
  content: NonNullable<Dictionary["campaignSuitePage"]>;
}

export function CampaignSuiteWizard({
  children,
  content,
}: CampaignSuiteWizardProps): React.ReactElement {
  logger.info("[CampaignSuiteWizard] Renderizando orquestador v2.1.");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { draft, setStep, updateDraft, isLoading } = useCampaignDraft();

  const currentStepId = useMemo(() => {
    const stepParam = searchParams.get("step");
    return stepParam ? parseInt(stepParam, 10) : 0;
  }, [searchParams]);

  useEffect(() => {
    setStep(currentStepId);
  }, [currentStepId, setStep]);

  const handleNavigation = useCallback(
    (newStepId: number) => {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("step", String(newStepId));
      router.push(`?${newParams.toString()}`);
    },
    [router, searchParams]
  );

  const handleNextStep = useCallback(() => {
    let canAdvance = true;
    if (currentStepId === 1) {
      canAdvance = validateStep1(draft).isValid;
    }
    if (canAdvance) {
      const newCompletedSteps = Array.from(
        new Set([...draft.completedSteps, currentStepId])
      );
      updateDraft({ completedSteps: newCompletedSteps });
      if (currentStepId < stepsConfig.length - 1) {
        handleNavigation(currentStepId + 1);
      }
    }
  }, [currentStepId, draft, updateDraft, handleNavigation]);

  const handlePrevStep = useCallback(() => {
    if (currentStepId > 0) {
      handleNavigation(currentStepId - 1);
    }
  }, [currentStepId, handleNavigation]);

  const handleStepClick = useCallback(
    (stepId: number) => {
      if (
        draft.completedSteps.includes(stepId) ||
        stepId === currentStepId ||
        draft.completedSteps.includes(stepId - 1)
      ) {
        handleNavigation(stepId);
      }
    },
    [draft.completedSteps, currentStepId, handleNavigation]
  );

  const wizardContextValue = useMemo(
    () => ({ goToNextStep: handleNextStep, goToPrevStep: handlePrevStep }),
    [handleNextStep, handlePrevStep]
  );

  const progressSteps: ProgressStep[] = useMemo(
    () =>
      stepsConfig.map((step) => ({
        id: step.id,
        title: step.titleKey,
        status:
          step.id === currentStepId
            ? "active"
            : draft.completedSteps.includes(step.id)
              ? "completed"
              : "pending",
      })),
    [currentStepId, draft.completedSteps]
  );

  const progressContextValue = useMemo(
    () => ({ steps: progressSteps, onStepClick: handleStepClick }),
    [progressSteps, handleStepClick]
  );

  // --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: Guardia de Contrato] ---
  // Se verifica que el contenido necesario para el componente hijo exista.
  if (!content.preview) {
    const errorMessage =
      "El contrato de datos i18n para 'campaignSuitePage' está incompleto. Falta la clave 'preview'.";
    logger.error(`[CampaignSuiteWizard] ${errorMessage}`);
    return (
      <DeveloperErrorDisplay
        context="CampaignSuiteWizard"
        errorMessage={errorMessage}
        errorDetails="Verifica que el archivo 'messages/pages/dev/campaign-suite.i18n.json' y su schema correspondiente ('dev-campaign-suite.schema.ts') incluyan la sección 'preview'."
      />
    );
  }
  // --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

  return (
    <WizardProvider value={wizardContextValue}>
      <ProgressContext.Provider value={progressContextValue}>
        <WizardClientLayout
          stepContent={children}
          previewContent={content.preview} // Ahora es seguro pasar esta prop.
          isLoadingDraft={isLoading}
        />
      </ProgressContext.Provider>
    </WizardProvider>
  );
}
