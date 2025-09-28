// RUTA: src/components/features/campaign-suite/Step1_Structure/Step1Client.tsx
/**
 * @file Step1Client.tsx
 * @description Componente Contenedor de Cliente para el Paso 1. Orquesta la
 *              lógica de estado y la delega al componente de presentación.
 * @version 7.0.0 (ACS Path & State Logic Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { logger } from "@/shared/lib/logging";
import { Step1Form } from "./Step1Form";
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import { useStep1StructureStore } from "@/shared/hooks/campaign-suite/use-step1-structure.store";
import { useDraftMetadataStore } from "@/shared/hooks/campaign-suite/use-draft-metadata.store";
import { type Step1ContentSchema } from "@/shared/lib/schemas/campaign-suite/steps/step1.schema";
import type { z } from "zod";
import type {
  HeaderConfig,
  FooterConfig,
} from "@/shared/lib/types/campaigns/draft.types";

// SSoT de Tipos para Props
type Step1Content = z.infer<typeof Step1ContentSchema>;

interface Step1ClientProps {
  content: Step1Content;
}

export function Step1Client({ content }: Step1ClientProps): React.ReactElement {
  // Pilar III (Observabilidad)
  logger.info("Renderizando Step1Client v7.0 (ACS Aligned).");

  // Hooks para la gestión de estado y navegación
  const { headerConfig, footerConfig, updateHeaderConfig, updateFooterConfig } =
    useStep1StructureStore();
  const { completeStep } = useDraftMetadataStore();
  const { goToNextStep, goToPrevStep } = useWizard();

  // Manejadores de eventos que contienen la lógica
  const handleHeaderConfigChange = (newConfig: Partial<HeaderConfig>) => {
    updateHeaderConfig(newConfig);
  };

  const handleFooterConfigChange = (newConfig: Partial<FooterConfig>) => {
    updateFooterConfig(newConfig);
  };

  const handleNext = () => {
    logger.info("[Step1Client] El usuario avanza al Paso 2.");
    completeStep(1);
    goToNextStep();
  };

  // El componente de cliente delega la renderización de la UI al componente de presentación puro
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
