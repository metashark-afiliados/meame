// RUTA: shared/lib/stores/campaign-draft.store.ts
/**
 * @file campaign-draft.store.ts
 * @description Store de Zustand para el estado global del borrador de la SDC.
 * @version 3.0.0 (Template Application Logic)
 * @author RaZ Podestá - MetaShark Tech
 */
import { create } from "zustand";
import { logger } from "@/shared/lib/logging";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import {
  initialCampaignDraftState,
  type CampaignDraftState,
} from "./initial-campaign-draft.state";

export interface CampaignDraftActions {
  // ... (otras acciones existentes: updateStepData, updateLayout, etc.)
  applyTemplate: (templateDraft: CampaignDraft) => void;
  resetDraft: () => void;
}

export const useCampaignDraftStore = create<
  CampaignDraftState & CampaignDraftActions
>((set, get) => ({
  ...initialCampaignDraftState,

  // ... (implementaciones de otras acciones) ...

  applyTemplate: (templateDraft) => {
    logger.info("[Store] Aplicando plantilla al borrador...", {
      templateName: templateDraft.variantName,
    });
    set({
      ...templateDraft, // Reemplaza completamente el estado con los datos de la plantilla
      isHydratedFromTemplate: true, // Marca que el borrador actual proviene de una plantilla
    });
  },

  resetDraft: () => {
    logger.warn("[Store] Reiniciando el borrador al estado inicial.");
    set(initialCampaignDraftState);
  },
}));
