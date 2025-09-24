// app/[locale]/(dev)/bavi/_components/AssetSelectorModal.tsx
/**
 * @file AssetSelectorModal.tsx
 * @description Orquestador modal de élite para seleccionar un activo de la BAVI.
 * @version 2.0.0 (FSD Architecture Alignment)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { AssetExplorer } from "./AssetExplorer";
import { logger } from "@/shared/lib/logging";
import type { BaviAsset } from "@/shared/lib/schemas/bavi/bavi.manifest.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { PromptCreatorContentSchema } from "@/shared/lib/schemas/raz-prompts/prompt-creator.i18n.schema";
import type { z } from "zod";

type CreatorContent = z.infer<typeof PromptCreatorContentSchema>;

interface AssetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetSelect: (asset: BaviAsset) => void;
  locale: Locale;
  content: {
    modalTitle: string;
    modalDescription: string;
    assetExplorerContent: {
      title: string;
      description: string;
      searchPlaceholder: string;
      searchButton: string;
      filterByAILabel: string;
      allAIsOption: string;
      loadingAssets: string;
      noAssetsFoundTitle: string;
      noAssetsFoundDescription: string;
      previousPageButton: string;
      nextPageButton: string;
      pageInfo: string;
      selectAssetButton: string;
    };
    sesaOptions: CreatorContent["sesaOptions"];
  };
}

export function AssetSelectorModal({
  isOpen,
  onClose,
  onAssetSelect,
  locale,
  content,
}: AssetSelectorModalProps): React.ReactElement {
  logger.info("[AssetSelectorModal] Renderizando modal selector de activos.");
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{content.modalTitle}</DialogTitle>
          <DialogDescription>{content.modalDescription}</DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2">
          <AssetExplorer
            locale={locale}
            content={content.assetExplorerContent}
            sesaOptions={content.sesaOptions}
            onAssetSelect={onAssetSelect}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
// app/[locale]/(dev)/bavi/_components/AssetSelectorModal.tsx
