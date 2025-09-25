// RUTA: src/components/features/campaign-suite/Step1_Structure/_components/StructuralSectionConfig.tsx
/**
 * @file StructuralSectionConfig.tsx
 * @description Aparato atómico para un bloque de configuración estructural.
 * @version 2.1.0 (Sovereign Path Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
import { ComponentGallery } from "@/components/features/campaign-suite/_components/shared";
import type { GalleryItem } from "@/shared/lib/config/campaign-suite/gallery.config";
import { logger } from "@/shared/lib/logging";
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---

interface StructuralSectionConfigProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  switchId: string;
  switchLabel: string;
  galleryTitle: string;
  galleryItems: readonly GalleryItem[];
  selectedValue: string | null;
  onSelectionChange: (value: string) => void;
  descriptions: {
    [key: string]: string;
  };
}

export function StructuralSectionConfig({
  isEnabled,
  onToggle,
  switchId,
  switchLabel,
  galleryTitle,
  galleryItems,
  selectedValue,
  onSelectionChange,
  descriptions,
}: StructuralSectionConfigProps): React.ReactElement {
  logger.trace(`[StructuralSectionConfig] Renderizando para: ${switchLabel}`);
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-subtle">
      <div className="flex items-center space-x-3">
        <Switch id={switchId} checked={isEnabled} onCheckedChange={onToggle} />
        <Label
          htmlFor={switchId}
          className="font-semibold text-lg cursor-pointer"
        >
          {switchLabel}
        </Label>
      </div>
      {isEnabled && (
        <div className="pl-8 pt-4 border-l-2 border-primary/20 space-y-4 animate-in fade-in-0 duration-300">
          <h4 className="font-medium text-foreground">{galleryTitle}</h4>
          <ComponentGallery
            items={galleryItems}
            selectedValue={selectedValue}
            onValueChange={onSelectionChange}
            descriptions={descriptions}
          />
        </div>
      )}
    </div>
  );
}
