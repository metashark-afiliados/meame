// RUTA: src/components/features/campaign-suite/_components/StepClientWrapper.tsx
/**
 * @file StepClientWrapper.tsx
 * @description Ensamblador y Despachador de Pasos dinámico para la SDC.
 * @version 13.0.0 (Dynamic Step Dispatcher & Build Stability)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { logger } from "@/shared/lib/logging";
import { stepsConfig } from "@/shared/lib/config/campaign-suite/wizard.config";
import type { StepProps } from "@/shared/lib/types/campaigns/step.types";
import { Step0 } from "../Step0_Identity";
import { Step1 } from "../Step1_Structure";
import { Step2 } from "../Step2_Layout";
import { Step3 } from "../Step3_Theme";
import { Step4 } from "../Step4_Content";
import { Step5 } from "../Step5_Management";

// Mapa que asocia el ID del paso con su componente React.
const stepComponentMap: Record<number, React.ComponentType<StepProps<any>>> = {
  0: Step0,
  1: Step1,
  2: Step2,
  3: Step3,
  4: Step4,
  5: Step5,
};

interface StepClientWrapperProps {
  stepContent: object;
}

export function StepClientWrapper({
  stepContent,
}: StepClientWrapperProps): React.ReactElement {
  logger.info("Renderizando StepClientWrapper v13.0 (Dynamic Dispatcher)");

  const searchParams = useSearchParams();
  const currentStepId = parseInt(searchParams.get("step") || "0", 10);

  const StepComponent = stepComponentMap[currentStepId];

  if (!StepComponent) {
    const errorMessage = `Componente no encontrado para el paso ${currentStepId}.`;
    logger.error(`[StepClientWrapper] ${errorMessage}`);
    return (
      <div className="text-destructive text-center p-8">{errorMessage}</div>
    );
  }

  const stepConfig = stepsConfig.find(s => s.id === currentStepId);
  logger.success(
    `[StepClientWrapper] Despachando al componente para el paso ${currentStepId}: ${stepConfig?.titleKey}`
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStepId}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <StepComponent content={stepContent} />
      </motion.div>
    </AnimatePresence>
  );
}
// RUTA: src/components/features/campaign-suite/_components/StepClientWrapper.tsx
