// app/[locale]/(dev)/dev/campaign-suite/_components/Step4_Content/Step4Client.tsx
/**
 * @file Step4Client.tsx
 * @description Componente Contenedor de Cliente para el Paso 4 (Contenido).
 * @version 3.6.0 (Rules of Hooks & FSD Alignment)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState } from "react";
import { useCampaignDraft } from "@/shared/hooks/campaign-suite/use-campaign-draft";
import { logger } from "@/shared/lib/logging";
import { Step4Form } from "./Step4Form";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import { z } from "zod";
import { Step4ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step4.schema";

type Step4Content = z.infer<typeof Step4ContentSchema>;

interface Step4ClientProps {
  content?: Step4Content;
}

export function Step4Client({ content }: Step4ClientProps): React.ReactElement {
  logger.info("[Step4Client] Renderizando contenedor (Rules of Hooks Fix)");

  const { draft, updateSectionContent } = useCampaignDraft();
  const { goToNextStep, goToPrevStep } = useWizard();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  if (!content) {
    logger.error("[Step4Client] El contenido para el Paso 4 es indefinido.");
    return (
      <div className="text-destructive p-8">
        Error: Faltan datos de contenido para este paso.
      </div>
    );
  }

  const handleEditSection = (sectionName: string) =>
    setEditingSection(sectionName);
  const handleCloseEditor = () => setEditingSection(null);

  const handleUpdateContent = (
    sectionName: string,
    locale: Locale,
    field: string,
    value: unknown
  ) => {
    updateSectionContent(sectionName, locale, field, value);
  };

  const handleNext = () => goToNextStep();

  return (
    <Step4Form
      content={content}
      draft={draft}
      onEditSection={handleEditSection}
      onCloseEditor={handleCloseEditor}
      editingSection={editingSection}
      onUpdateContent={handleUpdateContent}
      onBack={goToPrevStep}
      onNext={handleNext}
      isPending={false}
    />
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_components/Step4_Content/Step4Client.tsx
