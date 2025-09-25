// RUTA: src/shared/hooks/campaign-suite/use-step4-content.store.ts
/**
 * @file use-step4-content.store.ts
 * @description Store atómico para los datos del Paso 4 (Contenido).
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { logger } from "@/shared/lib/logging";
import type { ContentData } from "@/shared/lib/types/campaigns/draft.types";
import type { Locale } from "@/shared/lib/i18n/i18n.config";

interface Step4State {
  contentData: ContentData;
}

interface Step4Actions {
  setSectionContent: (
    sectionName: string,
    locale: Locale,
    field: string,
    value: unknown
  ) => void;
  // Acción para hidratar el store desde la BD.
  hydrateContent: (data: ContentData) => void;
  resetContent: () => void;
}

const initialState: Step4State = {
  contentData: {},
};

export const useStep4ContentStore = create<Step4State & Step4Actions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setSectionContent: (sectionName, locale, field, value) => {
        logger.trace(`[Step4Store] Actualizando contenido para ${sectionName}.${locale}.${field}`);

        // Usamos structuredClone para una copia profunda segura y moderna.
        const newContentData = structuredClone(get().contentData);

        // Se asegura de que las estructuras anidadas existan antes de asignar.
        if (!newContentData[sectionName]) {
          newContentData[sectionName] = {};
        }
        if (!newContentData[sectionName][locale]) {
          newContentData[sectionName][locale] = {};
        }

        newContentData[sectionName][locale]![field] = value;

        set({ contentData: newContentData });
        // Aquí se notificaría al store orquestador para el debounce de guardado.
      },
      hydrateContent: (data) => {
        logger.info("[Step4Store] Hidratando store con datos de la base de datos.");
        set({ contentData: data });
      },
      resetContent: () => {
        logger.warn("[Step4Store] Reiniciando los datos de contenido.");
        set(initialState);
      },
    }),
    {
      name: "campaign-draft-step4-content", // Clave de persistencia granular
      storage: createJSONStorage(() => localStorage),
    }
  )
);
