// RUTA: src/components/features/campaign-suite/Step2_Layout/Step2Client.tsx
/**
 * @file Step2Client.tsx
 * @description Componente Contenedor de Cliente para el Paso 2 (Layout).
 *              Restaurado para un cumplimiento estricto de las Reglas de los Hooks de React,
 *              blindado con guardianes y observabilidad de élite.
 * @version 6.1.0 (React Hooks Contract Restoration)
 *@author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useCallback, useMemo, useEffect } from "react";
import { z } from "zod";
import { logger } from "@/shared/lib/logging";
import type { LayoutConfigItem } from "@/shared/lib/types/campaigns/draft.types";
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import { Step2Form } from "./Step2Form";
import { useStep2LayoutStore } from "@/shared/hooks/campaign-suite/use-step2-layout.store";
import { useDraftMetadataStore } from "@/shared/hooks/campaign-suite/use-draft-metadata.store";
import { type Step2ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step2.schema";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";

type Step2Content = z.infer<typeof Step2ContentSchema>;

interface Step2ClientProps {
  content: Step2Content;
}

export function Step2Client({ content }: Step2ClientProps): React.ReactElement {
  const traceId = useMemo(
    () => logger.startTrace("Step2Client_Lifecycle_v6.1"),
    []
  );

  useEffect(() => {
    logger.info("[Step2Client] Componente montado y listo para operaciones.", {
      traceId,
    });
    return () => {
      logger.endTrace(traceId);
    };
  }, [traceId]);

  // --- [INICIO: REFACTORIZACIÓN ARQUITECTÓNICA (REGLAS DE HOOKS)] ---
  // Todas las llamadas a hooks se mueven al nivel superior, ANTES de
  // cualquier lógica condicional o retorno temprano.
  const { layoutConfig, setLayoutConfig } = useStep2LayoutStore();
  const { completeStep } = useDraftMetadataStore();
  const wizardContext = useWizard();

  const handleLayoutChange = useCallback(
    (newLayout: LayoutConfigItem[]) => {
      logger.traceEvent(
        traceId,
        "Acción: Layout modificado, actualizando store de layout...",
        { newLayout }
      );
      setLayoutConfig(newLayout);
    },
    [setLayoutConfig, traceId]
  );

  const handleNext = useCallback(() => {
    if (wizardContext) {
      logger.traceEvent(traceId, "Acción: Usuario avanza al Paso 3.");
      completeStep(2);
      wizardContext.goToNextStep();
    }
  }, [completeStep, wizardContext, traceId]);

  const handleBack = useCallback(() => {
    if (wizardContext) {
      logger.traceEvent(traceId, "Acción: Usuario retrocede al Paso 1.");
      wizardContext.goToPrevStep();
    }
  }, [wizardContext, traceId]);
  // --- [FIN: REFACTORIZACIÓN ARQUITECTÓNICA] ---

  // --- [GUARDIANES DE RESILIENCIA] ---
  // Los guardianes se ejecutan después de la llamada incondicional a los hooks.
  if (!wizardContext) {
    const errorMsg =
      "Guardián de Contexto: El componente Step2Client se renderizó fuera de un WizardProvider.";
    logger.error(`[Step2Client] ${errorMsg}`, { traceId });
    return (
      <DeveloperErrorDisplay
        context="Step2Client Guardián de Contexto"
        errorMessage={errorMsg}
      />
    );
  }

  if (!content) {
    const errorMsg =
      "Guardián de Contrato: La prop 'content' es nula o indefinida.";
    logger.error(`[Step2Client] ${errorMsg}`, { traceId });
    return (
      <DeveloperErrorDisplay
        context="Step2Client Guardián de Contenido"
        errorMessage={errorMsg}
      />
    );
  }

  return (
    <Step2Form
      content={content}
      layoutConfig={layoutConfig}
      onLayoutChange={handleLayoutChange}
      onBack={handleBack}
      onNext={handleNext}
    />
  );
}
