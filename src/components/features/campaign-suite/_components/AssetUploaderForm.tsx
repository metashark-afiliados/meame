// RUTA: src/components/features/campaign-suite/_components/AssetUploaderForm.tsx
/**
 * @file AssetUploaderForm.tsx
 * @description Componente de presentación puro para la UI del AssetUploader en la SDC.
 * @version 3.0.0 (FSD Architecture Alignment & Import Integrity Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import type { UseFormReturn } from "react-hook-form";
import type { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";
import type { UploadApiResponse } from "cloudinary";
import { Form, Button, DynamicIcon } from "@/components/ui";
// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
import {
  AssetDropzone,
  MetadataForm,
  UploadPreview,
} from "@/components/features/bavi/_components/AssetUploader/_components";
import { SesaTagsFormGroup } from "@/components/features/raz-prompts/_components/SesaTagsFormGroup";
import type { AssetUploadMetadata } from "@/shared/lib/schemas/bavi/upload.schema";
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

type UploaderContent = NonNullable<Dictionary["baviUploader"]>;
type SesaContent = NonNullable<Dictionary["promptCreator"]>["sesaLabels"] & {
  options: NonNullable<Dictionary["promptCreator"]>["sesaOptions"];
};

interface AssetUploaderFormProps {
  form: UseFormReturn<AssetUploadMetadata>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
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
          <SesaTagsFormGroup
            control={form.control}
            content={{
              ...sesaContent,
              options: sesaContent.options,
            }}
          />
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
