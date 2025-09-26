// RUTA: src/components/features/campaign-suite/Step1_Structure/Step1Client.tsx
/**
 * @file Step1Client.tsx
 * @description Componente Contenedor de Cliente para el Paso 1, ahora
 *              consumiendo stores atómicos.
 * @version 6.0.0 (Atomic State Consumption)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { logger } from "@/shared/lib/logging";
import { Step1Form } from "./Step1Form";
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import { useStep1StructureStore } from "@/shared/hooks/campaign-suite/use-step1-structure.store";
import { useDraftMetadataStore } from "@/shared/hooks/campaign-suite/use-draft-metadata.store";
import { type Step1ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step1.schema";
import type { z } from "zod";
import type {
  HeaderConfig,
  FooterConfig,
} from "@/shared/lib/types/campaigns/draft.types";

type Step1Content = z.infer<typeof Step1ContentSchema>;

interface Step1ClientProps {
  content?: Step1Content;
}

export function Step1Client({ content }: Step1ClientProps): React.ReactElement {
  logger.info("Renderizando Step1Client (v6.0 - Atomic State).");

  const { headerConfig, footerConfig, updateHeaderConfig, updateFooterConfig } =
    useStep1StructureStore();
  const { completeStep } = useDraftMetadataStore();
  const { goToNextStep, goToPrevStep } = useWizard();

  if (!content) {
    logger.error("[Step1Client] El contenido para el Paso 1 es indefinido.");
    return (
      <div className="text-destructive p-8">
        Error: Faltan datos de contenido para este paso.
      </div>
    );
  }

  const handleHeaderConfigChange = (newConfig: Partial<HeaderConfig>) => {
    updateHeaderConfig(newConfig);
  };

  const handleFooterConfigChange = (newConfig: Partial<FooterConfig>) => {
    updateFooterConfig(newConfig);
  };

  const handleNext = () => {
    completeStep(1);
    goToNextStep();
  };

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
