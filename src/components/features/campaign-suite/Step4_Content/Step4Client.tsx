// RUTA: src/components/features/campaign-suite/Step4_Content/Step4Client.tsx
/**
 * @file Step4Client.tsx
 * @description Componente Contenedor de Cliente para el Paso 4 (Contenido).
 * @version 6.0.0 (ACS Path & State Logic Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useMemo } from "react";
import { logger } from "@/shared/lib/logging";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import { useStep2LayoutStore } from "@/shared/hooks/campaign-suite/use-step2-layout.store";
import { useStep4ContentStore } from "@/shared/hooks/campaign-suite/use-step4-content.store";
import { useDraftMetadataStore } from "@/shared/hooks/campaign-suite/use-draft-metadata.store";
import { Step4Form } from "./Step4Form";
import type { z } from "zod";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import { Step4ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step4.schema";

type Step4Content = z.infer<typeof Step4ContentSchema>;

interface Step4ClientProps {
  content?: Step4Content;
}

export function Step4Client({ content }: Step4ClientProps): React.ReactElement {
  logger.info("Renderizando Step4Client (v6.0 - ACS Aligned).");

  const { layoutConfig } = useStep2LayoutStore();
  const { contentData, setSectionContent } = useStep4ContentStore();
  const metadata = useDraftMetadataStore();
  const { goToNextStep, goToPrevStep } = useWizard();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const assembledDraft: CampaignDraft = useMemo(
    () => ({
      ...metadata,
      layoutConfig,
      contentData,
      affiliateNetwork: null,
      affiliateUrl: null,
      headerConfig: { useHeader: false, componentName: null, logoPath: null },
      footerConfig: { useFooter: false, componentName: null },
      themeConfig: {
        colorPreset: null,
        fontPreset: null,
        radiusPreset: null,
      },
      step: 4,
    }),
    [metadata, layoutConfig, contentData]
  );

  if (!content) {
    logger.error("[Step4Client] El contenido para el Paso 4 es indefinido.");
    return <div className="text-destructive p-8">Error de contenido.</div>;
  }

  const handleUpdateContent = (
    sectionName: string,
    locale: Locale,
    field: string,
    value: unknown
  ) => {
    setSectionContent(sectionName, locale, field, value);
  };

  const handleNext = () => {
    metadata.completeStep(4);
    goToNextStep();
  };

  return (
    <Step4Form
      content={content}
      draft={assembledDraft}
      onEditSection={setEditingSection}
      onCloseEditor={() => setEditingSection(null)}
      editingSection={editingSection}
      onUpdateContent={handleUpdateContent}
      onBack={goToPrevStep}
      onNext={handleNext}
      isPending={false}
    />
  );
}
