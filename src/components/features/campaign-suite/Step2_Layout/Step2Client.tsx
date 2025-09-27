// RUTA: src/components/features/campaign-suite/Step2_Layout/Step2Client.tsx
/**
 * @file Step2Client.tsx
 * @description Componente Contenedor de Cliente para el Paso 2 (Layout).
 * @version 5.0.0 (ACS Path & State Logic Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { logger } from "@/shared/lib/logging";
import type { LayoutConfigItem } from "@/shared/lib/types/campaigns/draft.types";
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import { Step2Form } from "./Step2Form";
import { useStep2LayoutStore } from "@/shared/hooks/campaign-suite/use-step2-layout.store";
import { useDraftMetadataStore } from "@/shared/hooks/campaign-suite/use-draft-metadata.store";
import { type Step2ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step2.schema";
import type { z } from "zod";

type Step2Content = z.infer<typeof Step2ContentSchema>;

interface Step2ClientProps {
  content?: Step2Content;
}

export function Step2Client({ content }: Step2ClientProps): React.ReactElement {
  logger.info("Renderizando Step2Client (v5.0 - ACS Aligned).");

  const { layoutConfig, setLayoutConfig } = useStep2LayoutStore();
  const { completeStep } = useDraftMetadataStore();
  const { goToNextStep, goToPrevStep } = useWizard();

  if (!content) {
    logger.error("[Step2Client] El contenido para el Paso 2 es indefinido.");
    return (
      <div className="text-destructive p-8">
        Error: Faltan datos de contenido para este paso.
      </div>
    );
  }

  const handleLayoutChange = (newLayout: LayoutConfigItem[]) => {
    logger.trace(
      "[Step2Client] Layout modificado, actualizando store de layout..."
    );
    setLayoutConfig(newLayout);
  };

  const handleNext = () => {
    logger.info("[Step2Client] El usuario avanza al Paso 3.");
    completeStep(2);
    goToNextStep();
  };

  return (
    <Step2Form
      content={content}
      layoutConfig={layoutConfig}
      onLayoutChange={handleLayoutChange}
      onBack={goToPrevStep}
      onNext={handleNext}
    />
  );
}
