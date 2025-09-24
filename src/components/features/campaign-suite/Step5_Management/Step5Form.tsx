// RUTA: app/[locale]/(dev)/dev/campaign-suite/_components/Step5_Management/Step5Form.tsx
/**
 * @file Step5Form.tsx
 * @description Aparato de presentación puro para la maquetación del Paso 5.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { AlertDialog } from "@/components/ui/AlertDialog";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import type { ChecklistItem } from "../../_utils/draft.validator";
import type { z } from "zod";
import type { Step5ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step5.schema";
import { CampaignSummary } from "./_components/CampaignSummary";
import { LaunchChecklist } from "./_components/LaunchChecklist";
import { ManagementActions } from "./_components/ManagementActions";
import { DeleteDraftDialog } from "./_components/DeleteDraftDialog";

type Content = z.infer<typeof Step5ContentSchema>;

// Props gigantescas son aceptables aquí, ya que es un componente de presentación puro
// que actúa como un integrador para toda la lógica de su padre.
interface Step5FormProps {
  draft: CampaignDraft;
  checklistItems: ChecklistItem[];
  content: Content;
  onBack: () => void;
  onPublish: () => void;
  onPackage: () => void;
  onConfirmDelete: () => void;
  onSaveAsTemplate: (name: string, description: string) => void;
  isPublishing: boolean;
  isPackaging: boolean;
  isDeleting: boolean;
  isSavingTemplate: boolean;
  isLaunchReady: boolean;
}

export function Step5Form({
  draft,
  checklistItems,
  content,
  onBack,
  onPublish,
  onPackage,
  onConfirmDelete,
  onSaveAsTemplate,
  isPublishing,
  isPackaging,
  isDeleting,
  isSavingTemplate,
  isLaunchReady,
}: Step5FormProps): React.ReactElement {
  return (
    <AlertDialog>
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <CampaignSummary
            draft={draft}
            title={content.summaryTitle}
            placeholder={content.summaryPlaceholder}
          />
          <LaunchChecklist
            items={checklistItems}
            title={content.checklistTitle}
          />
        </div>
        <ManagementActions
          onBack={onBack}
          onPublish={onPublish}
          onPackage={onPackage}
          onSaveAsTemplate={onSaveAsTemplate}
          isPublishing={isPublishing}
          isPackaging={isPackaging}
          isDeleting={isDeleting}
          isSavingTemplate={isSavingTemplate}
          isLaunchReady={isLaunchReady}
          publishButtonText={content.publishButtonText}
          packageButtonText={content.packageButtonText}
          deleteButtonText={content.deleteButtonText}
          templateButtonText={content.templateButtonText}
          templateDialogContent={content.templateDialog}
        />
      </div>
      <DeleteDraftDialog
        content={content.deleteDialog}
        onConfirmDelete={onConfirmDelete}
      />
    </AlertDialog>
  );
}
