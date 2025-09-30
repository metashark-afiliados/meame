// RUTA: src/components/features/form-builder/builder/SchemaFieldRenderer/_components/fields/ImageField/ImageField.tsx
/**
 * @file ImageField.tsx
 * @description Componente de campo de imagen de élite, como un Client Component soberano.
 * @version 11.1.0 (Code Hygiene)
 * @author L.I.A. Legacy
 */
"use client";

import React from "react"; // <-- Se eliminan useState y useEffect no utilizados
import type { FieldValues } from "react-hook-form";
import { usePathname } from "next/navigation";
import { logger } from "@/shared/lib/logging";
import { getCurrentLocaleFromPathname } from "@/shared/lib/utils/i18n/i18n.utils";
import type { FieldComponentProps } from "../../../_types/field.types";
import { useImageField } from "./_hooks/use-image-field";
import { ImagePreview, ImageFieldActions } from "./_components";
import { AssetSelectorModal } from "@/components/features/bavi/_components/AssetSelectorModal";

export function ImageField<TFieldValues extends FieldValues>({
  field,
  onValueChange,
  fieldName,
}: FieldComponentProps<TFieldValues>) {
  logger.info("[ImageField] Renderizando v11.1 (Code Hygiene).");

  const pathname = usePathname();
  const locale = getCurrentLocaleFromPathname(pathname);

  const {
    isUploading,
    isSelectorOpen,
    setIsSelectorOpen,
    handleImageUpload,
    handleRemoveImage,
    handleAssetSelected,
  } = useImageField(onValueChange, fieldName);

  const currentImageValue = field.value as string | null;

  return (
    <div className="space-y-2">
      {currentImageValue && (
        <ImagePreview
          src={currentImageValue}
          alt={`Vista previa para ${String(fieldName)}`}
          onRemove={handleRemoveImage}
        />
      )}
      <ImageFieldActions
        onUpload={handleImageUpload}
        onSelectClick={() => setIsSelectorOpen(true)}
        isUploading={isUploading}
        hasImage={!!currentImageValue}
      />
      {isSelectorOpen && (
        <AssetSelectorModal
          isOpen={isSelectorOpen}
          onClose={() => setIsSelectorOpen(false)}
          onAssetSelect={handleAssetSelected}
          locale={locale}
        />
      )}
    </div>
  );
}
