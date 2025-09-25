// RUTA: src/components/features/raz-prompts/_components/PromptCard.tsx
/**
 * @file PromptCard.tsx
 * @description Componente de presentación para visualizar un prompt en la bóveda.
 * @version 5.0.0 (Creative Genome v4.0 & Data Enrichment)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { EnrichedRaZPromptsEntry } from "@/shared/lib/actions/raz-prompts";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

type SesaOptions = NonNullable<Dictionary["promptCreator"]>["sesaOptions"];
type VaultContent = NonNullable<Dictionary["promptVault"]>;

interface PromptCardProps {
  prompt: EnrichedRaZPromptsEntry;
  onViewDetails: (promptId: string) => void;
  sesaOptions: SesaOptions;
  content: Pick<VaultContent, "viewDetailsButton" | "noImageYet">;
}

export function PromptCard({
  prompt,
  onViewDetails,
  sesaOptions,
  content,
}: PromptCardProps): React.ReactElement {
  logger.trace(`[PromptCard] Renderizando v5.0 para: ${prompt.title}`);

  const latestVersion = prompt.versions[prompt.versions.length - 1];
  const formattedDate = new Date(prompt.createdAt).toLocaleDateString();

  const getTagLabel = (
    category: keyof SesaOptions,
    value: string | undefined
  ) => {
    if (!value) return null;
    return (
      sesaOptions[category]?.find((opt) => opt.value === value)?.label || value
    );
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-primary/20 transition-all duration-200 ease-in-out">
      <CardHeader>
        <CardTitle className="text-lg">{prompt.title}</CardTitle>
        <CardDescription className="flex items-center text-xs text-muted-foreground">
          <DynamicIcon name="BrainCircuit" className="h-3 w-3 mr-1" />
          {getTagLabel("ai", prompt.tags.ai)}
          <span className="mx-2">·</span>
          <DynamicIcon name="Clock" className="h-3 w-3 mr-1" />
          {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted/20 mb-4">
          {prompt.primaryImageUrl ? (
            <Image
              src={prompt.primaryImageUrl}
              alt={prompt.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <DynamicIcon name="ImageOff" className="h-6 w-6 mr-2" />
              <span>{content.noImageYet}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {latestVersion.promptText}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between pt-0 gap-2">
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary">
            {getTagLabel("sty", prompt.tags.sty)}
          </Badge>
          <Badge variant="secondary">
            {getTagLabel("fmt", prompt.tags.fmt)}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(prompt.promptId)}
        >
          <DynamicIcon name="Eye" className="h-4 w-4 mr-2" />
          {content.viewDetailsButton}
        </Button>
      </CardFooter>
    </Card>
  );
}
