// RUTA: src/components/features/campaign-suite/Step5_Management/Step5Client.tsx
/**
 * @file Step5Client.tsx
 * @description Orquestador de cliente para el Paso 5. Cumple estrictamente
 *              con las Reglas de los Hooks de React y está blindado con
 *              guardianes de resiliencia y observabilidad de élite.
 * @version 9.1.0 (API Contract Compliance)
 *@author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { z } from "zod";
import type { Step5ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step5.schema";
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import { useCampaignLifecycle } from "@/shared/hooks/campaign-suite/use-campaign-lifecycle";
import { useCampaignTemplates } from "@/shared/hooks/campaign-suite/use-campaign-templates";
import { useCelebrationStore } from "@/shared/lib/stores/use-celebration.store";
import { validateDraftForLaunch } from "@/shared/lib/utils/campaign-suite/draft.validator";
import { Step5Form } from "./Step5Form";
import { DigitalConfetti } from "@/components/ui/DigitalConfetti";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";
import { useWorkspaceStore } from "@/shared/lib/stores/use-workspace.store";
import { ArtifactHistory } from "./_components/ArtifactHistory";
import { useAssembledDraft } from "@/shared/hooks/campaign-suite/use-assembled-draft.hook";

type Content = z.infer<typeof Step5ContentSchema>;

interface Step5ClientProps {
  locale: Locale;
  stepContent: Content;
}

export function Step5Client({
  locale,
  stepContent,
}: Step5ClientProps): React.ReactElement {
  const traceId = useMemo(
    () => logger.startTrace("Step5Client_Lifecycle_v9.1"),
    []
  );
  useEffect(() => {
    logger.info("[Step5Client] Componente montado y listo para operaciones.", {
      traceId,
    });
    return () => {
      logger.endTrace(traceId);
    };
  }, [traceId]);

  const assembledDraft = useAssembledDraft();
  const { isCelebrating, endCelebration } = useCelebrationStore();
  const { goToPrevStep } = useWizard();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  const {
    onPublish,
    onPackage,
    onDelete,
    isPublishing,
    isPackaging,
    isDeleting,
  } = useCampaignLifecycle(locale, assembledDraft);
  const { onSaveAsTemplate, isSavingTemplate } =
    useCampaignTemplates(assembledDraft);

  const checklistItems = useMemo(
    () => validateDraftForLaunch(assembledDraft),
    [assembledDraft]
  );
  const isLaunchReady = useMemo(
    () => checklistItems.every((item) => item.isCompleted),
    [checklistItems]
  );

  const handlePublish = useCallback(() => {
    logger.traceEvent(
      traceId,
      "Intento de PUBLICACIÓN iniciado por el usuario."
    );
    onPublish();
  }, [onPublish, traceId]);

  const handlePackage = useCallback(() => {
    logger.traceEvent(
      traceId,
      "Intento de EMPAQUETADO iniciado por el usuario."
    );
    onPackage();
  }, [onPackage, traceId]);

  const handleDelete = useCallback(() => {
    logger.warn(
      "[Step5Client] Intento de ELIMINACIÓN DE BORRADOR iniciado por el usuario.",
      { traceId }
    );
    onDelete();
  }, [onDelete, traceId]);

  const handleSaveTemplate = useCallback(
    (name: string, description: string) => {
      logger.traceEvent(
        traceId,
        "Intento de GUARDAR COMO PLANTILLA iniciado.",
        { name }
      );
      onSaveAsTemplate(name, description);
    },
    [onSaveAsTemplate, traceId]
  );

  if (!stepContent) {
    const errorMsg =
      "Contrato de UI violado: La prop 'stepContent' es nula o indefinida.";
    logger.error(`[Step5Client] ${errorMsg}`, { traceId });
    return (
      <DeveloperErrorDisplay
        context="Step5Client Guardián de Contenido"
        errorMessage={errorMsg}
      />
    );
  }

  if (!assembledDraft.draftId || !activeWorkspaceId) {
    const errorMsg = "Faltan datos críticos para la gestión de la campaña.";
    logger.error(`[Step5Client] ${errorMsg}`, {
      hasDraftId: !!assembledDraft.draftId,
      hasWorkspaceId: !!activeWorkspaceId,
      traceId,
    });
    return (
      <DeveloperErrorDisplay
        context="Step5Client Guardián de Datos"
        errorMessage={errorMsg}
        errorDetails="El ID del borrador (draftId) o el ID del workspace activo no están disponibles en el estado global."
      />
    );
  }

  return (
    <>
      <Step5Form
        draft={assembledDraft}
        checklistItems={checklistItems}
        content={stepContent}
        onBack={goToPrevStep}
        onPublish={handlePublish}
        onPackage={handlePackage}
        onConfirmDelete={handleDelete}
        onSaveAsTemplate={handleSaveTemplate}
        isPublishing={isPublishing}
        isPackaging={isPackaging}
        isDeleting={isDeleting}
        isSavingTemplate={isSavingTemplate}
        isLaunchReady={isLaunchReady}
        artifactHistorySlot={
          // --- [INICIO DE CORRECCIÓN DE CONTRATO (TS2322)] ---
          // Se pasa el objeto 'artifactHistory' completo a la prop 'content'.
          <ArtifactHistory
            draftId={assembledDraft.draftId}
            content={stepContent.artifactHistory}
          />
          // --- [FIN DE CORRECCIÓN DE CONTRATO] ---
        }
      />
      <DigitalConfetti isActive={isCelebrating} onComplete={endCelebration} />
    </>
  );
}
