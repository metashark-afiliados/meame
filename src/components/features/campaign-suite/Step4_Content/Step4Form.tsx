// app/[locale]/(dev)/dev/campaign-suite/_components/Step4_Content/Step4Form.tsx
/**
 * @file Step4Form.tsx
 * @description Orquestador de presentación puro para el Paso 4.
 * @version 8.0.0 (Architectural Refactor)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui";
import { logger } from "@/shared/lib/logging";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import { WizardNavigation } from "@/components/features/campaign-suite/_components/WizardNavigation";
import { SectionList } from "./_components/SectionList";
import { EditorOrchestrator } from "./_components/EditorOrchestrator";
import type { Step4ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step4.schema";
import type { z } from "zod";
import type { Locale } from "@/shared/lib/i18n/i18n.config";

type Content = z.infer<typeof Step4ContentSchema>;

interface Step4FormProps {
  content: Content;
  draft: CampaignDraft;
  onEditSection: (sectionName: string) => void;
  onCloseEditor: () => void;
  editingSection: string | null;
  onUpdateContent: (
    sectionName: string,
    locale: Locale,
    field: string,
    value: unknown
  ) => void;
  onBack: () => void;
  onNext: () => void;
  isPending: boolean;
}

export function Step4Form({
  content,
  draft,
  onEditSection,
  onCloseEditor,
  editingSection,
  onUpdateContent,
  onBack,
  onNext,
  isPending,
}: Step4FormProps): React.ReactElement {
  logger.info("[Step4Form] Orquestando presentación del Paso 4 (v8.0).");

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{content.title}</CardTitle>
          <CardDescription>{content.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <SectionList
            layoutConfig={draft.layoutConfig}
            onEditSection={onEditSection}
            content={{
              editButtonText: content.editButtonText,
              emptyStateTitle: content.emptyStateTitle,
              emptyStateDescription: content.emptyStateDescription,
            }}
          />
          <WizardNavigation
            onBack={onBack}
            onNext={onNext}
            isPending={isPending}
            nextButtonText={content.nextButtonText}
          />
        </CardContent>
      </Card>

      <EditorOrchestrator
        draft={draft}
        editingSection={editingSection}
        onCloseEditor={onCloseEditor}
        onUpdateContent={onUpdateContent}
      />
    </>
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_components/Step4_Content/Step4Form.tsx
