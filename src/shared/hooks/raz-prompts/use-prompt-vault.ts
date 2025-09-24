// Ruta correcta: src/shared/hooks/raz-prompts/use-prompt-vault.ts
/**
 * @file use-prompt-vault.ts
 * @description Hook "cerebro" para la lógica de la Bóveda de Prompts.
 * @version 2.1.0 (Sovereign Path Normalization)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { logger } from "@/shared/lib/logging";
import {
  getPromptsAction,
  type GetPromptsInput,
} from "@/shared/lib/actions/raz-prompts";
import type { RaZPromptsEntry } from "@/shared/lib/schemas/raz-prompts/entry.schema";
import type { RaZPromptsSesaTags } from "@/shared/lib/schemas/raz-prompts/atomic.schema";

export function usePromptVault() {
  logger.trace("[Hook:usePromptVault] Inicializando lógica de la bóveda v2.1.");

  const [prompts, setPrompts] = useState<RaZPromptsEntry[]>([]);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<
    Partial<RaZPromptsSesaTags>
  >({});
  const limit = 9;

  const fetchPrompts = useCallback(
    (input: GetPromptsInput) => {
      startTransition(async () => {
        logger.trace("[usePromptVault] Iniciando fetch de prompts...", {
          input,
        });
        const result = await getPromptsAction(input);
        if (result.success) {
          setPrompts(result.data.prompts);
          setTotalPrompts(result.data.total);
        } else {
          toast.error("Error al cargar prompts", {
            description: result.error,
          });
          setPrompts([]);
          setTotalPrompts(0);
        }
      });
    },
    [startTransition]
  );

  useEffect(() => {
    fetchPrompts({
      page: currentPage,
      limit,
      query: searchQuery,
      tags: activeFilters,
    });
  }, [fetchPrompts, currentPage, searchQuery, activeFilters]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback(
    (category: keyof RaZPromptsSesaTags, value: string) => {
      setActiveFilters((prev: Partial<RaZPromptsSesaTags>) => {
        const newFilters = { ...prev };
        if (value === "all") {
          delete newFilters[category];
        } else {
          newFilters[category] = value;
        }
        return newFilters;
      });
      setCurrentPage(1);
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const totalPages = Math.ceil(totalPrompts / limit);

  return {
    prompts,
    isPending,
    currentPage,
    searchQuery,
    totalPages,
    handleSearch,
    handleFilterChange,
    handlePageChange,
  };
}
// Ruta correcta: src/shared/hooks/raz-prompts/use-prompt-vault.ts
