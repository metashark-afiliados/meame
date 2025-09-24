// app/[locale]/(dev)/raz-prompts/_components/VaultFilters.tsx
/**
 * @file VaultFilters.tsx
 * @description Componente de presentación puro para los controles de búsqueda
 *              y filtrado de la Bóveda de Prompts.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import {
  Input,
  Button,
  DynamicIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { logger } from "@/shared/lib/logging";
import type { RaZPromptsSesaTags } from "@/shared/lib/schemas/raz-prompts/atomic.schema";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

type SesaOptions = NonNullable<Dictionary["promptCreator"]>["sesaOptions"];
type VaultContent = NonNullable<Dictionary["promptVault"]>;

interface VaultFiltersProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onFilterChange: (category: keyof RaZPromptsSesaTags, value: string) => void;
  content: VaultContent;
  sesaOptions: SesaOptions;
  isPending: boolean;
}

export function VaultFilters({
  searchQuery,
  onSearch,
  onFilterChange,
  content,
  sesaOptions,
  isPending,
}: VaultFiltersProps): React.ReactElement {
  logger.info("[Observabilidad] Renderizando VaultFilters");

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleFormSubmit} className="flex gap-4">
        <Input
          placeholder={content.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit" disabled={isPending}>
          <DynamicIcon name="Search" className="h-4 w-4 mr-2" />
          {content.searchButton}
        </Button>
      </form>
      <div className="flex flex-wrap gap-2">
        <Select onValueChange={(value) => onFilterChange("ai", value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={content.filterByAILabel} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{content.allAIsOption}</SelectItem>
            {sesaOptions.ai.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Aquí se pueden añadir más filtros SESA de la misma manera */}
      </div>
    </div>
  );
}
// app/[locale]/(dev)/raz-prompts/_components/VaultFilters.tsx
