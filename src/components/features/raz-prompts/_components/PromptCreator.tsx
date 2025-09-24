// RUTA: app/[locale]/(dev)/raz-prompts/_components/PromptCreator.tsx
/**
 * @file PromptCreator.tsx
 * @description Componente contenedor "smart" para la creación de prompts.
 *              v3.0.0 (Naming Convention Fix): Se alinea la importación del
 *              hook con la convención de nomenclatura kebab-case.
 * @version 3.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { logger } from "@/shared/lib/logging";
// --- [INICIO DE CORRECCIÓN DE RUTA] ---
import { usePromptCreator } from "@/shared/hooks/raz-prompts/use-prompt-creator";
// --- [FIN DE CORRECCIÓN DE RUTA] ---
import { PromptCreatorForm } from "./PromptCreatorForm";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

interface PromptCreatorProps {
  content: NonNullable<Dictionary["promptCreator"]>;
}

export function PromptCreator({ content }: PromptCreatorProps) {
  logger.info("[Observabilidad] Renderizando PromptCreator v3.0");
  const { form, onSubmit, isPending } = usePromptCreator();

  return (
    <PromptCreatorForm
      form={form}
      onSubmit={onSubmit}
      isPending={isPending}
      content={content}
    />
  );
}
