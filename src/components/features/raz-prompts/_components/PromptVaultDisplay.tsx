// RUTA: src/components/features/raz-prompts/_components/PromptVaultDisplay.tsx
/**
 * @file PromptVaultDisplay.tsx
 * @description Componente de presentación puro y de élite para la Bóveda de Prompts.
 *              Este aparato es 100% data-driven y no tiene conocimiento de la
 *              lógica de estado, cumpliendo con la máxima atomización.
 * @version 2.0.0 (API Contract Alignment)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import { PromptGrid } from "./PromptGrid";
import { VaultFilters } from "./VaultFilters";
import { VaultPagination } from "./VaultPagination";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { usePromptVault } from "@/shared/hooks/raz-prompts/use-prompt-vault";
import { logger } from "@/shared/lib/logging";

type HookState = ReturnType<typeof usePromptVault>;
interface PromptVaultDisplayProps extends HookState {
  onViewDetails: (promptId: string) => void;
  content: NonNullable<Dictionary["promptCreator"]>;
  vaultContent: NonNullable<Dictionary["promptVault"]>;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function PromptVaultDisplay({
  prompts,
  isPending,
  currentPage,
  searchQuery,
  totalPages,
  activeFilters,
  handleSearch,
  handleFilterChange,
  handlePageChange,
  setSearchQuery,
  onViewDetails,
  content,
  vaultContent,
}: PromptVaultDisplayProps): React.ReactElement {
  logger.trace(
    "[PromptVaultDisplay] Renderizando componente de presentación v2.0."
  );
  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>{vaultContent.title}</CardTitle>
          <CardDescription>{vaultContent.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <VaultFilters
            searchQuery={searchQuery}
            activeFilters={activeFilters}
            onSearchChange={setSearchQuery}
            onFilterChange={handleFilterChange}
            onSearchSubmit={handleSearch}
            content={vaultContent}
            sesaOptions={content.sesaOptions}
            isPending={isPending}
          />
          <PromptGrid
            prompts={prompts}
            isLoading={isPending && prompts.length === 0}
            onViewDetails={onViewDetails}
            content={vaultContent}
            sesaOptions={content.sesaOptions}
          />
          <VaultPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isPending={isPending}
            content={vaultContent}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
