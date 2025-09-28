// RUTA: src/components/features/campaign-suite/Step3_Theme/Step3Client.tsx
/**
 * @file Step3Client.tsx
 * @description Contenedor de Cliente para el Paso 3, impulsado por la Bóveda de Estilos.
 * @version 10.0.0 (Persistent Theme Presets)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { logger } from "@/shared/lib/logging";
import type { ThemeConfig } from "@/shared/lib/types/campaigns/draft.types";
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import { useStep3ThemeStore } from "@/shared/hooks/campaign-suite/use-step3-theme.store";
import { useDraftMetadataStore } from "@/shared/hooks/campaign-suite/use-draft-metadata.store";
import { useWorkspaceStore } from "@/shared/lib/stores/use-workspace.store";
import { getThemePresetsAction, createThemePresetAction } from "@/shared/lib/actions/theme-presets";
import { Step3Form } from "./Step3Form";
import { ThemeComposerModal } from "./_components/ThemeComposerModal";
import { DynamicIcon } from "@/components/ui";
import type { z } from "zod";
import type { Step3ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step3.schema";
import type { ThemePreset } from "@/shared/lib/schemas/theme-preset.schema";

type Step3Content = z.infer<typeof Step3ContentSchema>;

interface Step3ClientProps {
  content: Step3Content;
}

export type CategorizedPresets = {
  global: ThemePreset[];
  workspace: ThemePreset[];
};

export function Step3Client({ content }: Step3ClientProps): React.ReactElement {
  logger.info("Renderizando Step3Client v10.0 (Persistent Themes).");

  const { themeConfig, updateThemeConfig } = useStep3ThemeStore();
  const { completeStep } = useDraftMetadataStore();
  const { goToNextStep, goToPrevStep } = useWizard();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [presets, setPresets] = useState<CategorizedPresets | null>(null);
  const [isFetching, startFetchingTransition] = useTransition();

  const fetchPresets = useCallback(() => {
    if (!activeWorkspaceId) return;
    startFetchingTransition(async () => {
      const result = await getThemePresetsAction(activeWorkspaceId);
      if (result.success) {
        setPresets(result.data);
      } else {
        toast.error("Error al cargar los estilos del workspace.", { description: result.error });
      }
    });
  }, [activeWorkspaceId]);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const handleCreatePreset = async (name: string, description: string, config: ThemeConfig) => {
    if (!activeWorkspaceId) return;
    const result = await createThemePresetAction({ workspaceId: activeWorkspaceId, name, description, themeConfig: config });
    if (result.success) {
      toast.success(`Preset "${name}" creado con éxito.`);
      fetchPresets(); // Re-fetch para actualizar la UI
    } else {
      toast.error("Error al crear el preset", { description: result.error });
    }
  };

  const handleNext = () => {
    completeStep(3);
    goToNextStep();
  };

  if (isFetching || !presets) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <DynamicIcon name="LoaderCircle" className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4">Cargando Bóveda de Estilos...</p>
      </div>
    );
  }

  return (
    <>
      <Step3Form
        content={content}
        themeConfig={themeConfig}
        onBack={goToPrevStep}
        onNext={handleNext}
        onLaunchComposer={() => setIsComposerOpen(true)}
      />

      <ThemeComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        presets={presets}
        currentConfig={themeConfig}
        onSave={updateThemeConfig}
        onCreatePreset={handleCreatePreset}
        content={content}
      />
    </>
  );
}
