// RUTA: components/forms/builder/SchemaFieldRenderer/_components/fields/ImageField/_hooks/use-image-field.ts
/**
 * @file use-image-field.ts
 * @description Hook "cerebro" puro para la lógica de acciones del ImageField.
 *              v3.2.0 (Module Resolution Fix): Corrige la ruta de importación
 *              de `useCampaignDraft` para alinearse con la SSoT de nomenclatura.
 * @version 3.2.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
// --- [INICIO DE CORRECCIÓN DE INTEGRIDAD] ---
import { useCampaignDraft } from "@/app/[locale]/(dev)/dev/campaign-suite/_hooks/use-campaign-draft";
// --- [FIN DE CORRECCIÓN DE INTEGRIDAD] ---
import { saveCampaignAssetAction } from "@/shared/lib/actions/campaign-suite/saveCampaignAsset.action";
import type { BaviAsset } from "@/shared/lib/schemas/bavi/bavi.manifest.schema";
import type { FieldValues, Path } from "react-hook-form";

export function useImageField<TFieldValues extends FieldValues>(
  onValueChange: (field: Path<TFieldValues>, value: unknown) => void,
  fieldName: Path<TFieldValues>
) {
  const { draft } = useCampaignDraft();
  const [isUploading, setIsUploading] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const handleImageUpload = useCallback(
    async (formData: FormData) => {
      if (!draft.baseCampaignId || !draft.draftId) {
        toast.error("Error de contexto", {
          description: "ID de borrador no encontrado.",
        });
        return;
      }
      setIsUploading(true);
      const result = await saveCampaignAssetAction(
        draft.baseCampaignId,
        draft.draftId,
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
    [draft.baseCampaignId, draft.draftId, fieldName, onValueChange]
  );

  const handleRemoveImage = useCallback(() => {
    onValueChange(fieldName, null);
    toast.info("Imagen eliminada del campo.");
  }, [fieldName, onValueChange]);

  const handleAssetSelected = useCallback(
    (asset: BaviAsset) => {
      const publicId = asset.variants[0]?.publicId;
      if (!publicId) {
        toast.error("Activo inválido");
        return;
      }
      const imageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
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
