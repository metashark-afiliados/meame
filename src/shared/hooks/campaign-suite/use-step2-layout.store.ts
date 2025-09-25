// RUTA: src/shared/hooks/campaign-suite/use-step2-layout.store.ts
/**
 * @file use-step2-layout.store.ts
 * @description Store atómico para los datos del Paso 2 (Layout Config).
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { logger } from "@/shared/lib/logging";
import type { LayoutConfigItem } from "@/shared/lib/types/campaigns/draft.types";

interface Step2State {
  layoutConfig: LayoutConfigItem[];
}

interface Step2Actions {
  setLayoutConfig: (newLayout: LayoutConfigItem[]) => void;
  addSection: (section: LayoutConfigItem) => void;
  removeSection: (sectionName: string) => void;
  reorderSections: (oldIndex: number, newIndex: number) => void;
  resetLayout: () => void;
}

const initialState: Step2State = {
  layoutConfig: [],
};

export const useStep2LayoutStore = create<Step2State & Step2Actions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setLayoutConfig: (newLayout) => {
        logger.trace("[Step2Store] Reemplazando el layout completo.");
        set({ layoutConfig: newLayout });
        // En una futura implementación, aquí se notificaría al store orquestador
        // para iniciar el debounce de guardado en la base de datos.
      },
      addSection: (section) => {
        logger.trace(`[Step2Store] Añadiendo sección: ${section.name}`);
        set((state) => ({
          layoutConfig: [...state.layoutConfig, section],
        }));
      },
      removeSection: (sectionName) => {
        logger.trace(`[Step2Store] Eliminando sección: ${sectionName}`);
        set((state) => ({
          layoutConfig: state.layoutConfig.filter(
            (s) => s.name !== sectionName
          ),
        }));
      },
      reorderSections: (oldIndex, newIndex) => {
        logger.trace(
          `[Step2Store] Reordenando secciones de índice ${oldIndex} a ${newIndex}.`
        );
        const currentLayout = get().layoutConfig;
        const newLayout = [...currentLayout];
        const [movedItem] = newLayout.splice(oldIndex, 1);
        newLayout.splice(newIndex, 0, movedItem);
        set({ layoutConfig: newLayout });
      },
      resetLayout: () => {
        logger.warn("[Step2Store] Reiniciando la configuración del layout.");
        set(initialState);
      },
    }),
    {
      name: "campaign-draft-step2-layout", // Clave de persistencia granular
      storage: createJSONStorage(() => localStorage),
    }
  )
);
// RUTA: src/shared/hooks/campaign-suite/use-step2-layout.store.ts
