// RUTA: app/[locale]/(dev)/dev/campaign-suite/_components/Step5_Management/_components/DeleteDraftDialog.tsx
/**
 * @file DeleteDraftDialog.tsx
 * @description Aparato atómico para el diálogo de confirmación de eliminación de borrador.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";
import React from "react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

type DeleteDialogContent = NonNullable<
  NonNullable<Dictionary["campaignSuitePage"]>["step5"]
>["deleteDialog"];

interface DeleteDraftDialogProps {
  content: DeleteDialogContent;
  onConfirmDelete: () => void;
}

export function DeleteDraftDialog({
  content,
  onConfirmDelete,
}: DeleteDraftDialogProps): React.ReactElement {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{content.title}</AlertDialogTitle>
        <AlertDialogDescription>{content.description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{content.cancelButton}</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirmDelete}>
          {content.confirmButton}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
