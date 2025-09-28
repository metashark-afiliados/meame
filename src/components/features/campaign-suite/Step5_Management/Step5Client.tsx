// RUTA: src/components/features/campaign-suite/Step5_Management/Step5Client.tsx
/**
 * @file Step5Client.tsx
 * @description Orquestador de cliente para el Paso 5. Ensambla el borrador
 *              final a partir de los stores atómicos y gestiona el ciclo de vida.
 * @version 5.0.0 (Holistic & Elite Compliance)
 * @author RaZ Podestá - MetaShark Tech
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

type Content = z.infer<typeof Step5ContentSchema>;

interface Step5ClientProps {
  locale: Locale;
  stepContent: Content;
}

export function Step5Client({
  locale,
  stepContent,
}: Step5ClientProps): React.ReactElement {
  logger.info("[Step5Client] Renderizando orquestador de cliente v5.0.");

  const metadata = useDraftMetadataStore();
  const identity = useStep0IdentityStore();
  const structure = useStep1StructureStore();
  const layout = useStep2LayoutStore();
  const theme = useStep3ThemeStore();
  const content = useStep4ContentStore();
  const { isCelebrating, endCelebration } = useCelebrationStore();
  const { goToPrevStep } = useWizard();

  const assembledDraft = useMemo((): CampaignDraft => {
    logger.trace("[Step5Client] Ensamblando borrador final desde stores...");
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

  const checklistItems = useMemo(
    () => validateDraftForLaunch(assembledDraft),
    [assembledDraft]
  );
  const isLaunchReady = useMemo(
    () => checklistItems.every((item) => item.isCompleted),
    [checklistItems]
  );

  return (
    <>
      <Step5Form
        draft={assembledDraft}
        checklistItems={checklistItems}
        content={stepContent}
        onBack={goToPrevStep}
        onPublish={onPublish}
        onPackage={onPackage}
        onConfirmDelete={onDelete}
        onSaveAsTemplate={onSaveAsTemplate}
        isPublishing={isPublishing}
        isPackaging={isPackaging}
        isDeleting={isDeleting}
        isSavingTemplate={isSavingTemplate}
        isLaunchReady={isLaunchReady}
      />
      <DigitalConfetti isActive={isCelebrating} onComplete={endCelebration} />
    </>
  );
}
