// RUTA: app/[locale]/(dev)/raz-prompts/_components/PromptVault.tsx
/**
 * @file PromptVault.tsx
 * @description Orquestador de élite para la Bóveda de Prompts. Cumple con los 5
 *              Pilares de Calidad, con animación de entrada y adherencia estricta
 *              a la arquitectura de nomenclatura y contratos de datos.
 * @version 4.0.0 (Holistic Elite Compliance & MEA/UX)
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
import { logger } from "@/shared/lib/logging";
// --- INICIO DE CORRECCIÓN ARQUITECTÓNICA (Pilar V) ---
import { usePromptVault } from "../_hooks/use-prompt-vault";
// --- FIN DE CORRECCIÓN ARQUITECTÓNICA ---
import { PromptGrid } from "./PromptGrid";
import { VaultFilters } from "./VaultFilters";
import { VaultPagination } from "./VaultPagination";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

// --- SSoT de Tipos y Animaciones ---
interface PromptVaultProps {
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

// --- Componente de Élite ---
export function PromptVault({
  content,
  vaultContent,
}: PromptVaultProps): React.ReactElement {
  logger.info("[PromptVault] Renderizando orquestador de élite v4.0.");

  const hookState = usePromptVault();

  const onViewPromptDetails = (promptId: string) => {
    logger.info(`[PromptVault] Acción: Ver detalles del prompt: ${promptId}`);
    // Lógica futura para mostrar un modal con detalles del prompt.
  };

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
            searchQuery={hookState.searchQuery}
            onSearch={hookState.handleSearch}
            onFilterChange={hookState.handleFilterChange}
            content={vaultContent}
            sesaOptions={content.sesaOptions}
            isPending={hookState.isPending}
          />
          <PromptGrid
            prompts={hookState.prompts}
            isLoading={hookState.isPending && hookState.prompts.length === 0}
            onViewDetails={onViewPromptDetails}
            content={vaultContent}
            // Pilar I: Se asegura el cumplimiento del contrato del componente hijo.
            sesaOptions={content.sesaOptions}
          />
          <VaultPagination
            currentPage={hookState.currentPage}
            totalPages={hookState.totalPages}
            onPageChange={hookState.handlePageChange}
            isPending={hookState.isPending}
            content={vaultContent}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
