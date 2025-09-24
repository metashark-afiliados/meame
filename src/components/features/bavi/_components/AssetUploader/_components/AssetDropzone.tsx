// app/[locale]/(dev)/bavi/_components/AssetUploader/_components/AssetDropzone.tsx
/**
 * @file AssetDropzone.tsx
 * @description Componente de presentación puro para la zona de arrastre de archivos.
 * @version 1.1.0 (Corruption Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";
import React from "react";
import Image from "next/image";

interface AssetDropzoneProps {
  getRootProps: <T extends React.HTMLAttributes<HTMLElement>>(props?: T) => T;
  getInputProps: <T extends React.InputHTMLAttributes<HTMLInputElement>>(
    props?: T
  ) => T;
  isDragActive: boolean;
  preview: string | null;
  text: string;
}

export function AssetDropzone({
  getRootProps,
  getInputProps,
  isDragActive,
  preview,
  text,
}: AssetDropzoneProps) {
  const className = `p-8 border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer transition-colors min-h-[240px] ${
    isDragActive
      ? "border-primary bg-primary/10"
      : "border-muted-foreground/30 hover:border-primary/50"
  }`;

  return (
    <div {...getRootProps()} className={className}>
      <input {...getInputProps()} />
      {preview ? (
        <Image
          src={preview}
          alt="Vista previa"
          width={200}
          height={200}
          className="object-contain max-h-48 rounded-md"
        />
      ) : (
        <p className="text-muted-foreground">{text}</p>
      )}
    </div>
  );
}
// app/[locale]/(dev)/bavi/_components/AssetUploader/_components/AssetDropzone.tsx
