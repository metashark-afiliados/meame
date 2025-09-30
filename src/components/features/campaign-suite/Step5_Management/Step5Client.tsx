// RUTA: src/components/features/campaign-suite/Step5_Management/Step5Client.tsx
/**
 * @file Step5Client.tsx
 * @description Orquestador de cliente para el Paso 5. Ensambla el borrador
 *              final, implementa un "Guardián de Datos" para resiliencia y
 *              provee observabilidad de élite para todas las acciones.
 * @version 6.0.0 (Elite Observability & Resilient Data Guardian)
 * @author L.I.A. Legacy
 */
"use client";

import React, { useMemo } from "react";
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
import { useDraftMetadataStore } from "@/shared/hooks/campaign-suite/use-draft-metadata.store";
import { useStep0IdentityStore } from "@/shared/hooks/campaign-suite/use-step0-identity.store";
import { useStep1StructureStore } from "@/shared/hooks/campaign-suite/use-step1-structure.store";
import { useStep2LayoutStore } from "@/shared/hooks/campaign-suite/use-step2-layout.store";
import { useStep3ThemeStore } from "@/shared/hooks/campaign-suite/use-step3-theme.store";
import { useStep4ContentStore } from "@/shared/hooks/campaign-suite/use-step4-content.store";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";
import { useWorkspaceStore } from "@/shared/lib/stores/use-workspace.store";
import { ArtifactHistory } from "./_components/ArtifactHistory";

type Content = z.infer<typeof Step5ContentSchema>;

interface Step5ClientProps {
  locale: Locale;
  stepContent: Content;
}

export function Step5Client({
  locale,
  stepContent,
}: Step5ClientProps): React.ReactElement {
  const traceId = logger.startTrace("Step5Client_Render_v6.0");
  logger.info(
    "[Step5Client] Renderizando orquestador de cliente v6.0 (Observable & Resilient).",
    { traceId }
  );

  const metadata = useDraftMetadataStore();
  const identity = useStep0IdentityStore();
  const structure = useStep1StructureStore();
  const layout = useStep2LayoutStore();
  const theme = useStep3ThemeStore();
  const content = useStep4ContentStore();
  const { isCelebrating, endCelebration } = useCelebrationStore();
  const { goToPrevStep } = useWizard();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  const assembledDraft = useMemo((): CampaignDraft => {
    logger.traceEvent(traceId, "Ensamblando borrador final desde stores...");
    return {
      draftId: metadata.draftId,
      baseCampaignId: metadata.baseCampaignId,
      variantName: metadata.variantName,
      seoKeywords: metadata.seoKeywords,
      completedSteps: metadata.completedSteps,
      updatedAt: metadata.updatedAt,
      producer: identity.producer,
      campaignType: identity.campaignType,
      headerConfig: structure.headerConfig,
      footerConfig: structure.footerConfig,
      layoutConfig: layout.layoutConfig,
      themeConfig: theme.themeConfig,
      contentData: content.contentData,
      step: 5,
    };
  }, [metadata, identity, structure, layout, theme, content]);

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

  // --- INICIO DEL GUARDIÁN DE DATOS ---
  if (!assembledDraft.draftId || !activeWorkspaceId) {
    const errorMsg = "Faltan datos críticos para la gestión de la campaña.";
    logger.error(`[Step5Client] ${errorMsg}`, {
      hasDraftId: !!assembledDraft.draftId,
      hasWorkspaceId: !!activeWorkspaceId,
      traceId,
    });
    logger.endTrace(traceId);
    return (
      <DeveloperErrorDisplay
        context="Step5Client"
        errorMessage={errorMsg}
        errorDetails="El ID del borrador (draftId) o el ID del workspace activo no están disponibles en el estado global. Asegúrate de que el Paso 0 se haya completado correctamente y que una sesión de usuario esté activa."
      />
    );
  }
  // --- FIN DEL GUARDIÁN DE DATOS ---

  const checklistItems = useMemo(
    () => validateDraftForLaunch(assembledDraft),
    [assembledDraft]
  );
  const isLaunchReady = useMemo(
    () => checklistItems.every((item) => item.isCompleted),
    [checklistItems]
  );

  // --- Wrapper de Acciones con Logging Explícito ---
  const handlePublish = () => {
    logger.info(
      "[Step5Client] Intento de publicación iniciado por el usuario.",
      { traceId }
    );
    onPublish();
  };
  const handlePackage = () => {
    logger.info(
      "[Step5Client] Intento de empaquetado iniciado por el usuario.",
      { traceId }
    );
    onPackage();
  };
  const handleDelete = () => {
    logger.warn(
      "[Step5Client] Intento de eliminación iniciado por el usuario.",
      { traceId }
    );
    onDelete();
  };
  const handleSaveTemplate = (name: string, description: string) => {
    logger.info("[Step5Client] Intento de guardar como plantilla iniciado.", {
      name,
      traceId,
    });
    onSaveAsTemplate(name, description);
  };

  logger.endTrace(traceId);
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
          <ArtifactHistory
            draftId={assembledDraft.draftId}
            title="Historial de Artefactos"
          />
        }
      />
      <DigitalConfetti isActive={isCelebrating} onComplete={endCelebration} />
    </>
  );
}
