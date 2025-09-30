// RUTA: src/components/features/raz-prompts/_components/PromptVault.tsx
/**
 * @file PromptVault.tsx
 * @description Contenedor "inteligente" para la Bóveda de Prompts.
 *              v6.1.0 (Diagnostic Trace Injection): Se inyecta logging de
 *              diagnóstico para trazar el flujo de renderizado.
 * @version 6.1.0
 * @author L.I.A. Legacy
 */
"use client";

import React from "react";
import { logger } from "@/shared/lib/logging";
import { usePromptVault } from "@/shared/hooks/raz-prompts/use-prompt-vault";
import { PromptVaultDisplay } from "./PromptVaultDisplay";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

interface PromptVaultProps {
  content: NonNullable<Dictionary["promptCreator"]>;
  vaultContent: NonNullable<Dictionary["promptVault"]>;
  traceId: string; // [INYECCIÓN DE LOGGING]
}

export function PromptVault({
  content,
  vaultContent,
  traceId, // [INYECCIÓN DE LOGGING]
}: PromptVaultProps): React.ReactElement {
  // [INYECCIÓN DE LOGGING]
  logger.traceEvent(
    traceId,
    "[PromptVault] Renderizando contenedor smart (v6.1)."
  );

  // La única responsabilidad de este componente es gestionar el estado.
  const hookState = usePromptVault(traceId); // [INYECCIÓN DE LOGGING]

  const onViewPromptDetails = (promptId: string) => {
    logger.info(`[PromptVault] Acción: Ver detalles del prompt: ${promptId}`);
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
