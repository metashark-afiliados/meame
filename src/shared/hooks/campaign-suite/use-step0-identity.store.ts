// RUTA: src/shared/hooks/campaign-suite/use-step0-identity.store.ts
/**
 * @file use-step0-identity.store.ts
 * @description Store atómico para el Paso 0, ahora con estado de proveedor y tipo de campaña.
 *              No utiliza persistencia directa; en su lugar, notifica al store orquestador
 *              para centralizar la lógica de guardado.
 * @version 2.2.0 (Build Integrity Fix)
 * @author L.I.A. Legacy
 */
"use client";

import { create } from "zustand";
import { logger } from "@/shared/lib/logging";
// --- [INICIO DE CORRECCIÓN DE INTEGRIDAD DE BUILD] ---
// Se corrige el nombre de la importación para que coincida con la exportación soberana.
import { useCampaignDraftStore } from "./use-campaign-draft-context.store";
// --- [FIN DE CORRECCIÓN DE INTEGRIDAD DE BUILD] ---

/**
 * @interface Step0Data
 * @description SSoT para la estructura del estado de este store.
 */
interface Step0Data {
  producer: string | null;
  campaignType: string | null;
}

/**
 * @interface Step0Actions
 * @description SSoT para las acciones que modifican el estado de este store.
 */
interface Step0Actions {
  setStep0Data: (data: Partial<Step0Data>) => void;
  resetStep0Data: () => void;
}

/**
 * @const initialState
 * @description SSoT para el estado inicial del store.
 */
const initialState: Step0Data = {
  producer: null,
  campaignType: null,
};

export const useStep0IdentityStore = create<Step0Data & Step0Actions>()(
  (set) => ({
    ...initialState,

    /**
     * @function setStep0Data
     * @description Actualiza el estado de identificación del Paso 0 y notifica
     *              al orquestador principal para que active el guardado "debounced".
     * @param data - Un objeto parcial con los nuevos datos de estado.
     */
    setStep0Data: (data) => {
      // Pilar III (Observabilidad)
      logger.trace(
        "[Step0Store] Actualizando datos de identificación y proveedor.",
        data
      );
      set((state) => ({ ...state, ...data }));
      // Notifica al orquestador para centralizar la lógica de persistencia
      useCampaignDraftStore.getState().triggerDebouncedSave();
    },

    /**
     * @function resetStep0Data
     * @description Restaura el estado de este store a sus valores iniciales.
     */
    resetStep0Data: () => {
      logger.warn("[Step0Store] Reiniciando datos de identificación.");
      set(initialState);
    },
  })
);
