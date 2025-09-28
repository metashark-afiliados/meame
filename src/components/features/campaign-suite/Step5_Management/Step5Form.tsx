// RUTA: src/components/features/campaign-suite/Step5_Management/Step5Form.tsx
/**
 * @file Step5Form.tsx
 * @description Aparato de presentación puro para la maquetación del Paso 5.
 * @version 16.0.0 (Artifact Vault Integration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
// ... (otras importaciones) ...
import { Separator } from "@/components/ui/Separator";

// ... (definiciones de tipo existentes) ...

interface Step5FormProps {
  // ... (props existentes) ...
  artifactHistorySlot: React.ReactNode;
}

export function Step5Form({
  // ... (props existentes) ...
  artifactHistorySlot,
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

        {artifactHistorySlot && (
          <>
            <Separator />
            {artifactHistorySlot}
          </>
        )}

        <ManagementActions
            // ... (props existentes) ...
        />
      </div>
      <DeleteDraftDialog
        content={content.deleteDialog}
        draftName={draft.variantName || ""}
        onConfirmDelete={onConfirmDelete}
        isDeleting={isDeleting}
      />
    </AlertDialog>
  );
}
