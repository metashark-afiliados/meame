// RUTA: src/shared/hooks/campaign-suite/use-step0-identity.store.ts
/**
 * @file use-step0-identity.store.ts
 * @description Store atómico para los datos del Paso 0 (Identificación).
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { logger } from "@/shared/lib/logging";

interface Step0Data {
  affiliateNetwork: string | null;
  affiliateUrl: string | null;
}

interface Step0Actions {
  setStep0Data: (data: Step0Data) => void;
  resetStep0Data: () => void;
}

const initialState: Step0Data = {
  affiliateNetwork: null,
  affiliateUrl: null,
};

export const useStep0IdentityStore = create<Step0Data & Step0Actions>()(
  persist(
    (set) => ({
      ...initialState,
      setStep0Data: (data) => {
        logger.trace(
          "[Step0Store] Actualizando datos de identificación.",
          data
        );
        set(data);
      },
      resetStep0Data: () => {
        logger.warn("[Step0Store] Reiniciando datos de identificación.");
        set(initialState);
      },
    }),
    {
      name: "campaign-draft-step0-identity",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
