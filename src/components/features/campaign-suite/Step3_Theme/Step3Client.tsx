// RUTA: src/components/features/campaign-suite/Step3_Theme/Step3Client.tsx
/**
 * @file Step3Client.tsx
 * @description Contenedor de Cliente para el Paso 3. Cumple estrictamente
 *              con las Reglas de los Hooks de React, asegura el flujo de
 *              datos completo y está blindado con guardianes de resiliencia
 *              y observabilidad de élite.
 * @version 11.2.0 (Definitive React Hooks & Data Flow Restoration)
 *@author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useTransition,
} from "react";
import { toast } from "sonner";
import { logger } from "@/shared/lib/logging";
import type { ThemeConfig } from "@/shared/lib/types/campaigns/draft.types";
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import { useStep3ThemeStore } from "@/shared/hooks/campaign-suite/use-step3-theme.store";
import { useDraftMetadataStore } from "@/shared/hooks/campaign-suite/use-draft-metadata.store";
import { useWorkspaceStore } from "@/shared/lib/stores/use-workspace.store";
import {
  getThemePresetsAction,
  createThemePresetAction,
} from "@/shared/lib/actions/theme-presets";
import { Step3Form } from "./Step3Form";
import { ThemeComposerModal } from "./_components/ThemeComposerModal";
import { DynamicIcon } from "@/components/ui";
import type { z } from "zod";
import type { Step3ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step3.schema";
import type { ThemePreset } from "@/shared/lib/schemas/theme-preset.schema";
import type { LoadedFragments } from "@/shared/lib/actions/campaign-suite";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";

type Step3Content = z.infer<typeof Step3ContentSchema>;

export type CategorizedPresets = {
  global: ThemePreset[];
  workspace: ThemePreset[];
};

interface Step3ClientProps {
  content: Step3Content;
  loadedFragments: LoadedFragments;
  fetchError: string | null;
}

export function Step3Client({
  content,
  loadedFragments,
  fetchError,
}: Step3ClientProps): React.ReactElement {
  const traceId = useMemo(
    () => logger.startTrace("Step3Client_Lifecycle_v11.2"),
    []
  );
  useEffect(() => {
    logger.info("[Step3Client] Componente montado.", { traceId });
    return () => logger.endTrace(traceId);
  }, [traceId]);

  // --- [INICIO: LLAMADAS A HOOKS INCONDICIONALES] ---
  const { themeConfig, updateThemeConfig } = useStep3ThemeStore();
  const { completeStep } = useDraftMetadataStore();
  const wizardContext = useWizard();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [presets, setPresets] = useState<CategorizedPresets | null>(null);
  const [isFetching, startFetchingTransition] = useTransition();

  const fetchPresets = useCallback(() => {
    if (!activeWorkspaceId) return;
    startFetchingTransition(async () => {
      logger.traceEvent(traceId, "Iniciando fetch de presets de tema...");
      const result = await getThemePresetsAction(activeWorkspaceId);
      if (result.success) {
        setPresets(result.data);
        logger.traceEvent(traceId, "Presets de tema cargados con éxito.");
      } else {
        toast.error("Error al cargar los estilos del workspace.", {
          description: result.error,
        });
        logger.error("[Step3Client] Fallo al cargar presets.", {
          error: result.error,
          traceId,
        });
      }
    });
  }, [activeWorkspaceId, traceId]);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const handleCreatePreset = useCallback(
    async (
      name: string,
      description: string,
      type: "color" | "font" | "geometry",
      config: ThemeConfig
    ) => {
      if (!activeWorkspaceId) return;
      logger.traceEvent(traceId, "Acción: Creando nuevo preset de tema.", {
        name,
        type,
      });
      const result = await createThemePresetAction({
        workspaceId: activeWorkspaceId,
        name,
        description,
        type,
        themeConfig: config,
      });
      if (result.success) {
        toast.success(`Preset "${name}" creado con éxito.`);
        fetchPresets();
      } else {
        toast.error("Error al crear el preset", { description: result.error });
      }
    },
    [activeWorkspaceId, fetchPresets, traceId]
  );

  const handleNext = useCallback(() => {
    if (wizardContext) {
      logger.traceEvent(traceId, "Acción: Usuario avanza al Paso 4.");
      completeStep(3);
      wizardContext.goToNextStep();
    }
  }, [completeStep, wizardContext, traceId]);
  // --- [FIN: LLAMADAS A HOOKS] ---

  // --- [GUARDIANES DE RESILIENCIA] ---
  if (fetchError) {
    logger.error(
      "[Guardián][Step3Client] Error de datos recibido del servidor.",
      { error: fetchError, traceId }
    );
    return (
      <DeveloperErrorDisplay
        context="Step3Client Guardián de Datos del Servidor"
        errorMessage={fetchError}
      />
    );
  }

  if (!wizardContext) {
    const errorMsg =
      "Guardián de Contexto: Renderizado fuera de WizardProvider.";
    logger.error(`[Step3Client] ${errorMsg}`, { traceId });
    return (
      <DeveloperErrorDisplay
        context="Step3Client Guardián de Contexto"
        errorMessage={errorMsg}
      />
    );
  }
  const { goToPrevStep } = wizardContext;

  if (isFetching || !presets) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <DynamicIcon
          name="LoaderCircle"
          className="w-8 h-8 animate-spin text-primary"
        />
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
        loadedFragments={loadedFragments}
      />
    </>
  );
}
