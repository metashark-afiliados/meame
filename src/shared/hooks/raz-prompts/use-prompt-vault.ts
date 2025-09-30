// RUTA: src/shared/hooks/raz-prompts/use-prompt-vault.ts
/**
 * @file use-prompt-vault.ts
 * @description Hook "cerebro" para la lógica de la Bóveda de Prompts.
 * @version 3.1.0 (Diagnostic Trace Injection): Se inyecta logging de
 *              diagnóstico para trazar el flujo de obtención de datos.
 * @version 3.1.0
 * @author L.I.A. Legacy
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

export function usePromptVault(traceId: string) {
  // [INYECCIÓN DE LOGGING]
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
        // [INYECCIÓN DE LOGGING]
        logger.traceEvent(
          traceId,
          "[usePromptVault] Iniciando fetch de prompts...",
          {
            input,
          }
        );
        const result = await getPromptsAction(input);
        if (result.success) {
          // [INYECCIÓN DE LOGGING]
          logger.traceEvent(
            traceId,
            "[usePromptVault] Fetch de prompts exitoso.",
            { count: result.data.prompts.length }
          );
          setPrompts(result.data.prompts);
          setTotalPrompts(result.data.total);
        } else {
          // [INYECCIÓN DE LOGGING]
          logger.error("[usePromptVault] Fetch de prompts fallido.", {
            error: result.error,
            traceId,
          });
          toast.error("Error al cargar prompts", { description: result.error });
          setPrompts([]);
          setTotalPrompts(0);
        }
      });
    },
    [startTransition, traceId] // [INYECCIÓN DE LOGGING]
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
    setCurrentPage(1);
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
    activeFilters,
    setSearchQuery,
    handleSearch,
    handleFilterChange,
    handlePageChange,
  };
}
