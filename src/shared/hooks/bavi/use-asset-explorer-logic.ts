// Ruta correcta: src/shared/hooks/bavi/use-asset-explorer-logic.ts
/**
 * @file use-asset-explorer-logic.ts
 * @description Hook de lógica de élite para el AssetExplorer.
 * @version 2.1.0 (Sovereign Path Normalization)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { logger } from "@/shared/lib/logging";
import {
  getBaviAssetsAction,
  type GetBaviAssetsInput,
} from "@/shared/lib/actions/bavi/getBaviAssets.action";
import type { BaviAsset } from "@/shared/lib/schemas/bavi/bavi.manifest.schema";
import type { RaZPromptsSesaTags } from "@/shared/lib/schemas/raz-prompts/atomic.schema";

interface AssetExplorerLogicReturn {
  assets: BaviAsset[];
  totalAssets: number;
  isPending: boolean;
  currentPage: number;
  searchQuery: string;
  activeFilters: Partial<RaZPromptsSesaTags>;
  totalPages: number;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  handleFilterChange: (
    category: keyof RaZPromptsSesaTags,
    value: string
  ) => void;
  handlePageChange: (page: number) => void;
}

export function useAssetExplorerLogic(): AssetExplorerLogicReturn {
  logger.trace("[useAssetExplorerLogic] Inicializando hook de lógica.");

  const [assets, setAssets] = useState<BaviAsset[]>([]);
  const [totalAssets, setTotalAssets] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<
    Partial<RaZPromptsSesaTags>
  >({});
  const limit = 10;

  const fetchAssets = useCallback(async (input: GetBaviAssetsInput) => {
    startTransition(async () => {
      logger.trace("[useAssetExplorerLogic] Iniciando fetch de activos...", {
        input,
      });
      const result = await getBaviAssetsAction(input);
      if (result.success) {
        setAssets(result.data.assets);
        setTotalAssets(result.data.total);
        logger.success("[useAssetExplorerLogic] Activos cargados con éxito.");
      } else {
        logger.error("[useAssetExplorerLogic] Fallo al cargar activos.", {
          error: result.error,
        });
        setAssets([]);
        setTotalAssets(0);
      }
    });
  }, []);

  useEffect(() => {
    fetchAssets({
      page: currentPage,
      limit,
      query: searchQuery,
      tags: activeFilters,
    });
  }, [fetchAssets, currentPage, searchQuery, activeFilters]);

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

  const totalPages = Math.ceil(totalAssets / limit);

  return {
    assets,
    totalAssets,
    isPending,
    currentPage,
    searchQuery,
    activeFilters,
    totalPages,
    setSearchQuery,
    handleSearch,
    handleFilterChange,
    handlePageChange,
  };
}
// Ruta correcta: src/shared/hooks/bavi/use-asset-explorer-logic.ts
