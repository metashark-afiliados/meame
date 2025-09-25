// RUTA: src/shared/hooks/raz-prompts/use-prompt-vault.ts
/**
 * @file use-prompt-vault.ts
 * @description Hook "cerebro" para la lógica de la Bóveda de Prompts.
 * @version 3.0.0 (Creative Genome v4.0)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { logger } from "@/shared/lib/logging";
import {
  getPromptsAction,
  type GetPromptsInput,
  type EnrichedRaZPromptsEntry,
} from "@/shared/lib/actions/raz-prompts";
import type { RaZPromptsSesaTags } from "@/shared/lib/schemas/raz-prompts/atomic.schema";

export function usePromptVault() {
  const [prompts, setPrompts] = useState<EnrichedRaZPromptsEntry[]>([]);
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
          toast.error("Error al cargar prompts", { description: result.error });
          // Resetea el estado en caso de error para evitar inconsistencias
          setPrompts([]);
          setTotalPrompts(0);
        }
      });
    },
    [startTransition] // startTransition es una dependencia estable
  );

  useEffect(() => {
    fetchPrompts({
      page: currentPage,
      limit,
      query: searchQuery,
      tags: activeFilters,
    });
  }, [fetchPrompts, currentPage, searchQuery, activeFilters]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Resetea la página al buscar
    // El useEffect se encargará de volver a llamar a fetchPrompts
  }, []);

  const handleFilterChange = useCallback(
    (category: keyof RaZPromptsSesaTags, value: string) => {
      setActiveFilters((prev) => {
        const newFilters = { ...prev };
        if (value === "all") {
          delete newFilters[category];
        } else {
          newFilters[category] = value;
        }
        return newFilters;
      });
      setCurrentPage(1); // Resetea la página al cambiar el filtro
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
    activeFilters,
    setSearchQuery,
    handleSearch,
    handleFilterChange,
    handlePageChange,
  };
}
