// RUTA: src/components/features/campaign-suite/Step2_Layout/_components/SectionLibrary.tsx
/**
 * @file SectionLibrary.tsx
 * @description Aparato atómico para la biblioteca de secciones disponibles.
 * @version 1.1.0 (Prop Contract Synchronization)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { logger } from "@/shared/lib/logging";

interface SectionLibraryProps {
  availableSections: { id: string; name: string }[];
  onAddSection: (sectionName: string) => void;
  title: string;
  emptyLibraryText: string; // <-- PROP AÑADIDA
}

export function SectionLibrary({ availableSections, onAddSection, title, emptyLibraryText }: SectionLibraryProps) {
  logger.trace("[SectionLibrary] Renderizando biblioteca v1.1 (Prop Contract Synced).");
  return (
    <div className="md:col-span-1 p-4 border rounded-lg bg-muted/20">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {availableSections.map((section) => (
          <div
            key={section.id}
            className="flex items-center justify-between p-2 border rounded-md bg-background"
          >
            <span className="text-sm font-medium">{section.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddSection(section.name)}
            >
              Añadir <DynamicIcon name="Plus" className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ))}
        {availableSections.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            {emptyLibraryText}
          </p>
        )}
      </div>
    </div>
  );
}
// RUTA: src/components/features/campaign-suite/Step2_Layout/_components/SectionLibrary.tsx
