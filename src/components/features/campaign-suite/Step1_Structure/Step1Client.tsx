// RUTA: src/components/features/campaign-suite/Step1_Structure/Step1Client.tsx
/**
 * @file Step1Client.tsx
 * @description Componente Contenedor de Cliente para el Paso 1. Orquesta la
 *              lógica de estado y la delega al componente de presentación.
 *              Blindado con un Guardián de Contrato y en cumplimiento estricto
 *              de las Reglas de los Hooks de React.
 * @version 8.1.0 (React Hooks Contract Restoration)
 * @author L.I.A. Legacy
 */
"use client";

import React, { useCallback } from "react";
import { z } from "zod";
import { logger } from "@/shared/lib/logging";
import { Step1Form } from "./Step1Form";
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import { useStep1StructureStore } from "@/shared/hooks/campaign-suite/use-step1-structure.store";
import { useDraftMetadataStore } from "@/shared/hooks/campaign-suite/use-draft-metadata.store";
import { type Step1ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step1.schema";
import type {
  HeaderConfig,
  FooterConfig,
} from "@/shared/lib/types/campaigns/draft.types";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";

type Step1Content = z.infer<typeof Step1ContentSchema>;

interface Step1ClientProps {
  content: Step1Content;
}

export function Step1Client({ content }: Step1ClientProps): React.ReactElement {
  logger.info(
    "[Step1Client] Renderizando orquestador de cliente v8.1 (Hooks-Compliant)."
  );

  // --- [INICIO: REFACTORIZACIÓN ARQUITECTÓNICA (REGLAS DE HOOKS)] ---
  // Todos los hooks se mueven al nivel superior del componente, ANTES de
  // cualquier lógica condicional o retorno temprano. Esto restaura el contrato de React.
  const { headerConfig, footerConfig, updateHeaderConfig, updateFooterConfig } =
    useStep1StructureStore();
  const { completeStep } = useDraftMetadataStore();
  const { goToNextStep, goToPrevStep } = useWizard();

  const handleHeaderConfigChange = useCallback(
    (newConfig: Partial<HeaderConfig>) => {
      logger.trace(
        "[Step1Client] Acción: Actualizando config de header.",
        newConfig
      );
      updateHeaderConfig(newConfig);
    },
    [updateHeaderConfig]
  );

  const handleFooterConfigChange = useCallback(
    (newConfig: Partial<FooterConfig>) => {
      logger.trace(
        "[Step1Client] Acción: Actualizando config de footer.",
        newConfig
      );
      updateFooterConfig(newConfig);
    },
    [updateFooterConfig]
  );

  const handleNext = useCallback(() => {
    logger.info("[Step1Client] Acción: Usuario avanza al Paso 2.");
    completeStep(1);
    goToNextStep();
  }, [completeStep, goToNextStep]);
  // --- [FIN: REFACTORIZACIÓN ARQUITECTÓNICA] ---

  // --- [GUARDIÁN DE CONTRATO] ---
  // El guardián ahora se ejecuta después de la llamada a los hooks.
  if (!content) {
    const errorMessage =
      "Contrato de UI violado: La prop 'content' es nula o indefinida.";
    logger.error(`[Guardián de Resiliencia][Step1Client] ${errorMessage}`);
    return (
      <DeveloperErrorDisplay
        context="Step1Client Guardián de Contenido"
        errorMessage={errorMessage}
      />
    );
  }

  return (
    <Step1Form
      content={content}
      headerConfig={headerConfig}
      footerConfig={footerConfig}
      onHeaderConfigChange={handleHeaderConfigChange}
      onFooterConfigChange={handleFooterConfigChange}
      onBack={goToPrevStep}
      onNext={handleNext}
    />
  );
}
