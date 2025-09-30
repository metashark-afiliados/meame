// RUTA: src/shared/hooks/campaign-suite/use-step1-structure.store.ts
/**
 * @file use-step1-structure.store.ts
 * @description Store atómico para el Paso 1 (Estructura). No persistente.
 *              Notifica al orquestador de los cambios para el guardado en BD.
 * @version 2.1.0 (Build Integrity Fix)
 * @author L.I.A. Legacy
 */
import { create } from "zustand";
import { logger } from "@/shared/lib/logging";
import type {
  HeaderConfig,
  FooterConfig,
} from "@/shared/lib/types/campaigns/draft.types";
import { deepMerge } from "@/shared/lib/utils";
// --- [INICIO DE CORRECCIÓN DE INTEGRIDAD DE BUILD] ---
// Se corrige el nombre de la importación para que coincida con la exportación soberana.
import { useCampaignDraftStore } from "./use-campaign-draft-context.store";
// --- [FIN DE CORRECCIÓN DE INTEGRIDAD DE BUILD] ---

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
      useCampaignDraftStore.getState().triggerDebouncedSave();
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
      useCampaignDraftStore.getState().triggerDebouncedSave();
    },
    reset: () => {
      logger.warn("[Step1Store] Reiniciando la configuración de estructura.");
      set(initialState);
    },
  })
);
