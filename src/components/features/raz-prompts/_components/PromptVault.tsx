// RUTA: src/components/features/raz-prompts/_components/PromptVault.tsx
/**
 * @file PromptVault.tsx
 * @description Contenedor "inteligente" para la Bóveda de Prompts.
 *              v6.0.0 (Atomic Architecture): Atomizado para separar la lógica
 *              de estado de la presentación, cumpliendo con el PRU de élite.
 * @version 6.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { logger } from "@/shared/lib/logging";
import { usePromptVault } from "@/shared/hooks/raz-prompts/use-prompt-vault";
import { PromptVaultDisplay } from "./PromptVaultDisplay"; // <-- Importa el nuevo componente de presentación
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

interface PromptVaultProps {
  content: NonNullable<Dictionary["promptCreator"]>;
  vaultContent: NonNullable<Dictionary["promptVault"]>;
}

export function PromptVault({
  content,
  vaultContent,
}: PromptVaultProps): React.ReactElement {
  logger.info("[PromptVault] Renderizando contenedor inteligente v6.0.");

  // La única responsabilidad de este componente es gestionar el estado.
  const hookState = usePromptVault();

  const onViewPromptDetails = (promptId: string) => {
    logger.info(`[PromptVault] Acción: Ver detalles del prompt: ${promptId}`);
    // Lógica futura para mostrar un modal con detalles del prompt.
  };

  // Delega toda la lógica de renderizado al componente de presentación puro.
  return (
    <PromptVaultDisplay
      {...hookState}
      onViewDetails={onViewPromptDetails}
      content={content}
      vaultContent={vaultContent}
    />
  );
}
// RUTA: src/components/features/raz-prompts/_components/PromptVault.tsx
