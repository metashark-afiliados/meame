// RUTA: src/components/features/campaign-suite/Step5_Management/Step5Form.tsx
/**
 * @file Step5Form.tsx
 * @description Aparato de presentación puro para la maquetación del Paso 5.
 * @version 16.1.0 (Holistic Integrity Restoration)
 * @author L.I.A. Legacy
 */
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  AlertDialog,
} from "@/components/ui";
import { Separator } from "@/components/ui/Separator";
import { logger } from "@/shared/lib/logging";
// --- [INICIO DE REFACTORIZACIÓN DE RUTA SOBERANA] ---
// Se corrige la ruta de importación eliminando el segmento erróneo '/campaign-suite'.
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
// --- [FIN DE REFACTORIZACIÓN DE RUTA SOBERANA] ---
import type { ChecklistItem } from "@/shared/lib/utils/campaign-suite/draft.validator";
import {
  CampaignSummary,
  ManagementActions,
  DeleteDraftDialog,
  LaunchChecklist,
} from "./_components";
import type { z } from "zod";
import type { Step5ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step5.schema";

type Content = z.infer<typeof Step5ContentSchema>;

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
  artifactHistorySlot: React.ReactNode;
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
  artifactHistorySlot,
}: Step5FormProps): React.ReactElement {
  logger.trace("[Step5Form] Renderizando orquestador de presentación v16.1.");

  return (
    <AlertDialog>
      <Card>
        <CardHeader>
          <CardTitle>{content.title}</CardTitle>
          <CardDescription>{content.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
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

          {artifactHistorySlot && (
            <>
              <Separator />
              {artifactHistorySlot}
            </>
          )}

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
        </CardContent>
      </Card>
      <DeleteDraftDialog
        content={content.deleteDialog}
        draftName={draft.variantName || ""}
        onConfirmDelete={onConfirmDelete}
        isDeleting={isDeleting}
      />
    </AlertDialog>
  );
}
