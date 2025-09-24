// app/[locale]/(dev)/raz-prompts/_components/PromptGrid.tsx
/**
 * @file PromptGrid.tsx
 * @description Componente de presentación puro para renderizar la cuadrícula
 *              de prompts y sus estados de carga/vacío.
 * @version 2.1.0 (Syntax Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { DynamicIcon } from "@/components/ui";
import { PromptCard } from "./PromptCard";
import { logger } from "@/shared/lib/logging";
import type { RaZPromptsEntry } from "@/shared/lib/schemas/raz-prompts/entry.schema";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

type VaultContent = NonNullable<Dictionary["promptVault"]>;
type SesaOptions = NonNullable<Dictionary["promptCreator"]>["sesaOptions"];

interface PromptGridProps {
  prompts: RaZPromptsEntry[];
  isLoading: boolean;
  onViewDetails: (promptId: string) => void;
  content: VaultContent;
  sesaOptions: SesaOptions;
}

export function PromptGrid({
  prompts,
  isLoading,
  onViewDetails,
  content,
  sesaOptions,
}: PromptGridProps): React.ReactElement {
  logger.info("[Observabilidad] Renderizando PromptGrid v2.1 (Syntax Fix)");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <DynamicIcon name="LoaderCircle" className="w-8 h-8 animate-spin" />
        <p className="ml-4">{content.loadingPrompts}</p>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground min-h-[300px]">
        <DynamicIcon name="FolderOpen" className="h-10 w-10 mx-auto mb-4" />
        <p>{content.noPromptsFound}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.promptId}
          prompt={prompt}
          onViewDetails={onViewDetails}
          sesaOptions={sesaOptions}
          content={content}
        />
      ))}
    </div>
  );
}
