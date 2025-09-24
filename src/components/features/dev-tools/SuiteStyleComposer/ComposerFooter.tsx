// app/[locale]/(dev)/dev/_components/SuiteStyleComposer/ComposerFooter.tsx
/**
 * @file ComposerFooter.tsx
 * @description Aparato de presentación puro para el pie de página del Compositor de Estilos de Suite.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { logger } from "@/shared/lib/logging";

interface ComposerFooterProps {
  onSave: () => void;
  onCancel: () => void;
  saveButtonText: string;
  cancelButtonText: string;
}

export function ComposerFooter({
  onSave,
  onCancel,
  saveButtonText,
  cancelButtonText,
}: ComposerFooterProps): React.ReactElement {
  logger.trace("[ComposerFooter] Renderizando.");
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onCancel}>
        {cancelButtonText}
      </Button>
      <Button onClick={onSave}>{saveButtonText}</Button>
    </DialogFooter>
  );
}
