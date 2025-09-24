// Ruta correcta: src/components/features/campaign-suite/_components/StepClientWrapper.tsx
/**
 * @file StepClientWrapper.tsx
 * @description Ensamblador y Renderizador de Pasos.
 *              v12.2.0 (Holistic Integrity Restoration): Resuelve todos los errores
 *              de resolución de módulo y de seguridad de tipos, alineando el
 *              aparato con la arquitectura FSD y los alias soberanos.
 * @version 12.2.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { logger } from "@/shared/lib/logging";
import {
  stepsConfig,
  type StepConfig,
} from "@/shared/lib/config/campaign-suite/wizard.config";
import type { StepProps } from "../_types/step.types";

interface StepClientWrapperProps {
  stepContent: object;
}

export function StepClientWrapper({
  stepContent,
}: StepClientWrapperProps): React.ReactElement {
  logger.info("Renderizando StepClientWrapper (v12.2 - Integridad Restaurada)");

  const searchParams = useSearchParams();
  const currentStepId = parseInt(searchParams.get("step") || "0", 10);

  // --- [INICIO DE CORRECCIÓN DE TIPO] ---
  const stepConfig = stepsConfig.find(
    (s: StepConfig) => s.id === currentStepId
  );
  // --- [FIN DE CORRECCIÓN DE TIPO] ---

  if (!stepConfig) {
    const errorMessage = `Configuración no encontrada para el paso ${currentStepId}.`;
    logger.error(`[StepClientWrapper] ${errorMessage}`);
    return (
      <div className="text-destructive text-center p-8">{errorMessage}</div>
    );
  }

  const StepComponent = stepConfig.Component as React.ComponentType<
    StepProps<object>
  >;

  logger.success(
    `[StepClientWrapper] Renderizando paso ${currentStepId}: ${stepConfig.titleKey}`
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
// Ruta correcta: src/components/features/campaign-suite/_components/StepClientWrapper.tsx
