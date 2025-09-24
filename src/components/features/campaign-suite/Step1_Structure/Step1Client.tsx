// app/[locale]/(dev)/dev/campaign-suite/_components/Step1_Structure/Step1Client.tsx
/**
 * @file Step1Client.tsx
 * @description Componente Contenedor de Cliente para el Paso 1.
 * @version 5.2.0 (Rules of Hooks & FSD Alignment)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { useCampaignDraft } from "@/shared/hooks/campaign-suite/use-campaign-draft";
import type {
  HeaderConfig,
  FooterConfig,
} from "@/shared/lib/types/campaigns/draft.types";
import { logger } from "@/shared/lib/logging";
import { Step1Form } from "./Step1Form";
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import { Step1ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step1.schema";
import { z } from "zod";

type Step1Content = z.infer<typeof Step1ContentSchema>;

interface Step1ClientProps {
  content?: Step1Content;
}

export function Step1Client({ content }: Step1ClientProps): React.ReactElement {
  logger.info("Renderizando Step1Client (Rules of Hooks Fix)");

  const { draft, updateDraft } = useCampaignDraft();
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
    updateDraft({
      headerConfig: { ...draft.headerConfig, ...newConfig },
    });
  };

  const handleFooterConfigChange = (newConfig: Partial<FooterConfig>) => {
    updateDraft({
      footerConfig: { ...draft.footerConfig, ...newConfig },
    });
  };

  return (
    <Step1Form
      content={content}
      headerConfig={draft.headerConfig}
      footerConfig={draft.footerConfig}
      onHeaderConfigChange={handleHeaderConfigChange}
      onFooterConfigChange={handleFooterConfigChange}
      onBack={goToPrevStep}
      onNext={goToNextStep}
    />
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_components/Step1_Structure/Step1Client.tsx
