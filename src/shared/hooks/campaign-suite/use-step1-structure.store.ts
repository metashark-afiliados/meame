// RUTA: src/shared/hooks/campaign-suite/use-step1-structure.store.ts
/**
 * @file use-step1-structure.store.ts
 * @description Store atómico para el Paso 1 (Estructura). No persistente.
 *              Notifica al orquestador de los cambios para el guardado en BD.
 * @version 2.0.0 (Orchestrator-Aware)
 * @author RaZ Podestá - MetaShark Tech
 */
import { create } from "zustand";
import { logger } from "@/shared/lib/logging";
import type {
  HeaderConfig,
  FooterConfig,
} from "@/shared/lib/types/campaigns/draft.types";
import { deepMerge } from "@/shared/lib/utils";
import { useCampaignDraftContext } from "./use-campaign-draft-context.store";

interface Step1State {
  headerConfig: HeaderConfig;
  footerConfig: FooterConfig;
}

interface Step1Actions {
  updateHeaderConfig: (config: Partial<HeaderConfig>) => void;
  updateFooterConfig: (config: Partial<FooterConfig>) => void;
  reset: () => void;
}

const initialState: Step1State = {
  headerConfig: { useHeader: true, componentName: null, logoPath: null },
  footerConfig: { useFooter: true, componentName: null },
};

export const useStep1StructureStore = create<Step1State & Step1Actions>()(
  (set) => ({
    ...initialState,
    updateHeaderConfig: (config) => {
      logger.trace(
        "[Step1Store] Actualizando configuración del header.",
        config
      );
      set((state) => ({
        headerConfig: deepMerge(state.headerConfig, config),
      }));
      // Notifica al orquestador que hubo un cambio.
      useCampaignDraftContext.getState().triggerDebouncedSave();
    },
    updateFooterConfig: (config) => {
      logger.trace(
        "[Step1Store] Actualizando configuración del footer.",
        config
      );
      set((state) => ({
        footerConfig: deepMerge(state.footerConfig, config),
      }));
      // Notifica al orquestador que hubo un cambio.
      useCampaignDraftContext.getState().triggerDebouncedSave();
    },
    reset: () => {
      logger.warn("[Step1Store] Reiniciando la configuración de estructura.");
      set(initialState);
    },
  })
);
