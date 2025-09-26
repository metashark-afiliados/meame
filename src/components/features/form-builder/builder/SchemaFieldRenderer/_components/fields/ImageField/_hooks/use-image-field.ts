// RUTA: src/components/features/form-builder/builder/SchemaFieldRenderer/_components/fields/ImageField/_hooks/use-image-field.ts
/**
 * @file use-image-field.ts
 * @description Hook "cerebro" puro para la lógica de acciones del ImageField.
 *              v4.0.0 (Holistic & Sovereign Path Restoration): Se realinean
 *              todas las importaciones a sus SSoT canónicas según la ACS,
 *              resolviendo errores críticos de build.
 * @version 4.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useDraftMetadataStore } from "@/shared/hooks/campaign-suite/use-draft-metadata.store";
import { saveCampaignAssetAction } from "@/shared/lib/actions/campaign-suite";
import type { BaviAsset } from "@/shared/lib/schemas/bavi/bavi.manifest.schema";
import type { FieldValues, Path } from "react-hook-form";
import { logger } from "@/shared/lib/logging";

export function useImageField<TFieldValues extends FieldValues>(
  onValueChange: (field: Path<TFieldValues>, value: unknown) => void,
  fieldName: Path<TFieldValues>
) {
  logger.trace("[useImageField] Inicializando hook v4.0 (Sovereign Paths).");
  const { baseCampaignId, draftId } = useDraftMetadataStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const handleImageUpload = useCallback(
    async (formData: FormData) => {
      if (!baseCampaignId || !draftId) {
        toast.error("Error de contexto", {
          description: "ID de borrador no encontrado. Guarda el Paso 0.",
        });
        return;
      }
      setIsUploading(true);
      const result = await saveCampaignAssetAction(
        baseCampaignId,
        draftId,
        formData
      );
      setIsUploading(false);

      if (result.success) {
        onValueChange(fieldName, result.data.path);
        toast.success("Imagen subida con éxito.");
      } else {
        toast.error("Fallo al subir imagen", { description: result.error });
      }
    },
    [baseCampaignId, draftId, fieldName, onValueChange]
  );

  const handleRemoveImage = useCallback(() => {
    onValueChange(fieldName, null);
    toast.info("Imagen eliminada del campo.");
  }, [fieldName, onValueChange]);

  const handleAssetSelected = useCallback(
    (asset: BaviAsset) => {
      const primaryVariant = asset.variants.find((v) => v.state === "orig");
      if (!primaryVariant?.publicId) {
        toast.error("Activo inválido", {
          description:
            "El activo seleccionado no tiene una variante principal válida.",
        });
        return;
      }
      const imageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${primaryVariant.publicId}`;
      onValueChange(fieldName, imageUrl);
      setIsSelectorOpen(false);
      toast.success(`Activo "${asset.assetId}" seleccionado.`);
    },
    [fieldName, onValueChange]
  );

  return {
    isUploading,
    isSelectorOpen,
    setIsSelectorOpen,
    handleImageUpload,
    handleRemoveImage,
    handleAssetSelected,
  };
}
