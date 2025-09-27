// RUTA: src/components/features/campaign-suite/Step3_Theme/Step3Client.tsx
/**
 * @file Step3Client.tsx
 * @description Contenedor de Cliente para el Paso 3. Orquesta el Compositor
 *              de Temas y consume los stores de tema y metadata atómicos.
 * @version 7.0.0 (Server-Hydrated & Elite Compliance)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState } from "react";
import { logger } from "@/shared/lib/logging";
import type { ThemeConfig } from "@/shared/lib/types/campaigns/draft.types";
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import { useStep3ThemeStore } from "@/shared/hooks/campaign-suite/use-step3-theme.store";
import { useDraftMetadataStore } from "@/shared/hooks/campaign-suite/use-draft-metadata.store";
import { Step3Form } from "./Step3Form";
import { ThemeComposerModal } from "./_components/ThemeComposerModal";
import { DynamicIcon } from "@/components/ui";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";
import type { z } from "zod";
import type { Step3ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step3.schema";
import type { LoadedFragments } from "./_components/ThemeComposerModal";

type Step3Content = z.infer<typeof Step3ContentSchema>;

interface Step3ClientProps {
  content?: Step3Content;
  loadedFragments: LoadedFragments | null;
  fetchError: string | null;
}

export function Step3Client({
  content,
  loadedFragments,
  fetchError,
}: Step3ClientProps): React.ReactElement {
  logger.info("Renderizando Step3Client (v7.0 - Server-Hydrated).");

  const { themeConfig, updateThemeConfig } = useStep3ThemeStore();
  const { completeStep } = useDraftMetadataStore();
  const { goToNextStep, goToPrevStep } = useWizard();

  const [isComposerOpen, setIsComposerOpen] = useState(false);

  if (fetchError) {
    return (
      <DeveloperErrorDisplay
        context="Step3Client"
        errorMessage="No se pudieron cargar los recursos para el compositor de temas."
        errorDetails={fetchError}
      />
    );
  }

  if (!loadedFragments) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <DynamicIcon
          name="LoaderCircle"
          className="w-8 h-8 animate-spin text-primary"
        />
        <p className="ml-4">Cargando recursos del compositor...</p>
      </div>
    );
  }

  if (!content) {
    logger.error("[Step3Client] El contenido para el Paso 3 es indefinido.");
    return (
      <div className="text-destructive p-8">
        Error: Faltan datos de contenido para este paso.
      </div>
    );
  }

  const handleThemeConfigChange = (newConfig: Partial<ThemeConfig>) => {
    updateThemeConfig(newConfig);
  };

  const handleNext = () => {
    logger.info("[Step3Client] El usuario avanza al Paso 4.");
    completeStep(3);
    goToNextStep();
  };

  return (
    <>
      <Step3Form
        content={content}
        themeConfig={themeConfig}
        onBack={goToPrevStep}
        onNext={handleNext}
        onLaunchComposer={() => setIsComposerOpen(true)}
      />

      {isComposerOpen && (
        <ThemeComposerModal
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          fragments={loadedFragments}
          currentConfig={themeConfig}
          onSave={handleThemeConfigChange}
          content={content}
        />
      )}
    </>
  );
}
