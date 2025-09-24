// app/[locale]/(dev)/dev/campaign-suite/_components/AssetUploader/_components/AssetUploaderForm.tsx
/**
 * @file AssetUploaderForm.tsx
 * @description Componente de presentación puro para la UI del AssetUploader.
 * @version 2.3.0 (Absolute Path Resolution)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import type { UseFormReturn } from "react-hook-form";
import type { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";
import type { UploadApiResponse } from "cloudinary";
import { Form, Button, DynamicIcon } from "@/components/ui";
// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
// Se utilizan rutas absolutas para importar los sub-componentes desde su
// ubicación canónica en el dominio BAVI, resolviendo los errores de módulo.
import { AssetDropzone } from "@/app/[locale]/(dev)/bavi/_components/AssetUploader/_components/AssetDropzone";
import { MetadataForm } from "@/app/[locale]/(dev)/bavi/_components/AssetUploader/_components/MetadataForm";
import { UploadPreview } from "@/app/[locale]/(dev)/bavi/_components/AssetUploader/_components/UploadPreview";
import { SesaTagsFormGroup } from "@/app/[locale]/(dev)/raz-prompts/_components/SesaTagsFormGroup";
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---
import type { AssetUploadMetadata } from "@/shared/lib/bavi/upload.schema";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

type UploaderContent = NonNullable<Dictionary["baviUploader"]>;
type SesaContent = NonNullable<Dictionary["promptCreator"]>["sesaLabels"] & {
  options: NonNullable<Dictionary["promptCreator"]>["sesaOptions"];
};

interface AssetUploaderFormProps {
  form: UseFormReturn<AssetUploadMetadata>;
  onSubmit: () => void;
  isPending: boolean;
  preview: string | null;
  uploadResult: UploadApiResponse | null;
  getRootProps: <T extends DropzoneRootProps>(props?: T | undefined) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T | undefined) => T;
  isDragActive: boolean;
  content: UploaderContent;
  sesaContent: SesaContent;
}

export function AssetUploaderForm({
  form,
  onSubmit,
  isPending,
  preview,
  uploadResult,
  getRootProps,
  getInputProps,
  isDragActive,
  content,
  sesaContent,
}: AssetUploaderFormProps) {
  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
      >
        <AssetDropzone
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          preview={preview}
          text={content.dropzoneDefault}
        />
        <div className="space-y-6">
          <MetadataForm control={form.control} content={content} />
          <SesaTagsFormGroup control={form.control} content={sesaContent} />
          <Button
            type="submit"
            disabled={isPending || !preview}
            className="w-full"
            size="lg"
          >
            {isPending && (
              <DynamicIcon
                name="LoaderCircle"
                className="mr-2 h-4 w-4 animate-spin"
              />
            )}
            {content.submitButtonText}
          </Button>
          <UploadPreview uploadResult={uploadResult} />
        </div>
      </form>
    </Form>
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_components/AssetUploader/_components/AssetUploaderForm.tsx
