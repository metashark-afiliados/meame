// app/[locale]/(dev)/dev/campaign-suite/_components/shared/ComponentGallery.tsx
/**
 * @file ComponentGallery.tsx
 * @description Componente de UI atómico para mostrar una selección visual.
 *              v5.0.0 (i18n & Layout Refactor): Consume descripciones i18n
 *              y utiliza un layout de una sola columna para mayor claridad.
 * @version 5.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Label } from "@/components/ui/Label";
import { cn } from "@/shared/lib/utils/cn";
import type { GalleryItem } from "../../_config/gallery.config";

interface ComponentGalleryProps {
  items: readonly GalleryItem[];
  selectedValue: string | null;
  onValueChange: (value: string) => void;
  descriptions: {
    [key: string]: string;
  };
}

export function ComponentGallery({
  items,
  selectedValue,
  onValueChange,
  descriptions,
}: ComponentGalleryProps) {
  return (
    <RadioGroup
      value={selectedValue ?? ""}
      onValueChange={onValueChange}
      // --- [INICIO DE MEJORA DE LAYOUT] ---
      // Ahora es una sola columna para hacer los items más grandes y claros.
      className="grid grid-cols-1 gap-4"
      // --- [FIN DE MEJORA DE LAYOUT] ---
    >
      {items.map((item) => (
        <Label
          key={item.name}
          htmlFor={item.name}
          className={cn(
            "block cursor-pointer rounded-lg border-2 bg-card p-2 transition-all hover:border-primary/80",
            selectedValue === item.name
              ? "border-primary shadow-lg ring-2 ring-primary/50"
              : "border-muted/50"
          )}
        >
          <RadioGroupItem
            value={item.name}
            id={item.name}
            className="sr-only"
          />
          <div
            className="relative w-full overflow-hidden rounded-md bg-muted/30"
            style={{ aspectRatio: "16 / 9" }}
          >
            <Image
              src={item.previewImage}
              alt={`Vista previa de ${item.name}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
          <div className="p-2 text-center">
            <p className="font-semibold text-foreground text-sm">{item.name}</p>
            {/* --- [INICIO DE MEJORA I18N] --- */}
            <p className="text-xs text-muted-foreground mt-1">
              {descriptions[item.name] || "Descripción no encontrada"}
            </p>
            {/* --- [FIN DE MEJORA I18N] --- */}
          </div>
        </Label>
      ))}
    </RadioGroup>
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_components/shared/ComponentGallery.tsx
