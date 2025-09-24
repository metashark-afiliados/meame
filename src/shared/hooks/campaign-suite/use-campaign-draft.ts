// Ruta correcta: src/shared/hooks/campaign-suite/use-campaign-draft.ts
/**
 * @file use-campaign-draft.ts
 * @description Hook de Zustand y SSoT para la gestión de estado híbrida (localStorage + DB)
 *              del borrador de campaña. Implementa guardado debounced y lógica de
 *              sincronización inteligente.
 * @version 17.1.0 (Linter Hygiene Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StateCreator } from "zustand";
import { toast } from "sonner";
import { logger } from "@/shared/lib/logging";
import { generateDraftId } from "@/shared/lib/utils/campaign-suite/draft.utils";
import { stepsConfig } from "@/shared/lib/config/campaign-suite/wizard.config";
import { initialCampaignDraftState } from "@/shared/lib/config/campaign-suite/draft.initial-state";
import type {
  CampaignDraft,
  CampaignDraftState,
} from "@/shared/lib/types/campaigns/draft.types";
import {
  saveDraftAction,
  getDraftAction,
} from "@/shared/lib/actions/campaign-suite/draft.actions";
import { deleteDraftAction } from "@/shared/lib/actions/campaign-suite/deleteDraft.action";
import {
  CampaignDraftDataSchema,
  type CampaignDraftDb,
} from "@/shared/lib/schemas/campaigns/draft.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";

let debounceTimeout: NodeJS.Timeout;
const DEBOUNCE_DELAY = 1500;

const storeCreator: StateCreator<CampaignDraftState> = (set, get) => ({
  draft: initialCampaignDraftState,
  isLoading: true,
  isSyncing: false,

  initializeDraft: async () => {
    logger.startGroup("[useCampaignDraft] Inicializando estado...");
    const localDraft = get().draft;
    const result = await getDraftAction();
    let draftToLoad = localDraft;

    if (result.success && result.data.draft) {
      const dbDraft = result.data.draft;
      if (new Date(dbDraft.updatedAt) >= new Date(localDraft.updatedAt)) {
        logger.info("[useCampaignDraft] Hidratando estado desde MongoDB.");
        draftToLoad = {
          ...localDraft,
          ...(dbDraft as Omit<CampaignDraftDb, "userId" | "createdAt">),
          updatedAt: dbDraft.updatedAt,
        };
      } else {
        logger.warn(
          "[useCampaignDraft] Caché local es más reciente. Sincronizando con DB."
        );
        get()._debouncedSave(localDraft);
      }
    } else {
      logger.info(
        "[useCampaignDraft] No hay borrador en DB. Usando caché local."
      );
    }
    set({ draft: draftToLoad, isLoading: false });
    logger.endGroup();
  },

  _debouncedSave: async (draftToSave: CampaignDraft) => {
    if (!draftToSave.draftId) {
      logger.warn(
        "[_debouncedSave] Intento de guardado sin draftId. Abortando."
      );
      return;
    }

    set({ isSyncing: true });
    logger.info(
      `[useCampaignDraft] Guardando borrador ${draftToSave.draftId} en DB...`
    );

    // --- [INICIO DE CORRECCIÓN DE HIGIENE DE CÓDIGO] ---
    // Se renombra 'step' a '_step' para indicar que no se utiliza, satisfaciendo la regla de linting.
    const { step: _step, ...dataToSave } = draftToSave;
    // --- [FIN DE CORRECCIÓN DE HIGIENE DE CÓDIGO] ---
    const validation = CampaignDraftDataSchema.safeParse(dataToSave);

    if (!validation.success) {
      toast.error("Error de datos", {
        description: "El borrador local tiene un formato inválido.",
      });
      set({ isSyncing: false });
      return;
    }

    const result = await saveDraftAction(validation.data);

    if (result.success) {
      toast.success("Progreso guardado en la nube.");
      set((state) => ({
        draft: { ...state.draft, updatedAt: result.data.updatedAt },
        isSyncing: false,
      }));
    } else {
      toast.error("Error al guardar en la nube", { description: result.error });
      set({ isSyncing: false });
    }
  },

  _updateAndDebounce: (
    newDraftState: Partial<Omit<CampaignDraft, "draftId" | "step">>
  ) => {
    clearTimeout(debounceTimeout);
    const currentState = get().draft;
    const newDraft: CampaignDraft = {
      ...currentState,
      ...newDraftState,
      updatedAt: new Date().toISOString(),
    };

    if (newDraftState.baseCampaignId && !currentState.draftId) {
      newDraft.draftId = generateDraftId(newDraftState.baseCampaignId);
    }

    set({ draft: newDraft });

    debounceTimeout = setTimeout(() => {
      get()._debouncedSave(newDraft);
    }, DEBOUNCE_DELAY);
  },

  updateDraft: (data: Partial<Omit<CampaignDraft, "step" | "draftId">>) => {
    get()._updateAndDebounce(data);
  },

  updateSectionContent: (
    sectionName: string,
    locale: Locale,
    field: string,
    value: unknown
  ) => {
    const currentState = get().draft;
    const newContentData = structuredClone(currentState.contentData);

    const sectionLocale = newContentData[sectionName]?.[locale] || {};
    sectionLocale[field] = value;

    if (!newContentData[sectionName]) {
      newContentData[sectionName] = {};
    }
    (newContentData[sectionName] as Record<string, unknown>)[locale] =
      sectionLocale;

    get()._updateAndDebounce({ contentData: newContentData });
  },

  setStep: (step: number) => {
    if (step >= 0 && step < stepsConfig.length) {
      set((state) => ({ draft: { ...state.draft, step } }));
    }
  },

  deleteDraft: async () => {
    const draftIdToDelete = get().draft.draftId;
    logger.warn("[useCampaignDraft] Iniciando eliminación de borrador...", {
      draftId: draftIdToDelete,
    });
    set({ draft: initialCampaignDraftState, isLoading: false });
    toast.success("Borrador eliminado de la sesión local.");
    clearTimeout(debounceTimeout);
    if (draftIdToDelete) {
      const result = await deleteDraftAction(draftIdToDelete);
      if (result.success) {
        toast.info("Borrador eliminado de la base de datos.");
      } else {
        toast.error("Error al eliminar el borrador de la base de datos.", {
          description: result.error,
        });
      }
    }
  },
});

export const useCampaignDraft = create<CampaignDraftState>()(
  persist(storeCreator, {
    name: "campaign-draft-storage",
    storage: createJSONStorage(() => localStorage),
    onRehydrateStorage: () => (state: CampaignDraftState | undefined) => {
      if (state) state.isLoading = true;
    },
  })
);
// Ruta correcta: src/shared/hooks/campaign-suite/use-campaign-draft.ts
