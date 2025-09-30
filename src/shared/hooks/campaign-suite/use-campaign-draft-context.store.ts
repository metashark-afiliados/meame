// RUTA: src/shared/hooks/campaign-suite/use-campaign-draft-context.store.ts
/**
 * @file use-campaign-draft-context.store.ts
 * @description Store Orquestador de élite para el ciclo de vida del borrador de campaña.
 *              Gestiona la hidratación, persistencia y reseteo con observabilidad y resiliencia.
 * @version 13.1.0 (Syntax & Resilience Restoration)
 * @author L.I.A. Legacy
 */
"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { logger } from "@/shared/lib/logging";
import {
  getDraftAction,
  saveDraftAction,
  deleteDraftAction,
} from "@/shared/lib/actions/campaign-suite";
import { useDraftMetadataStore } from "./use-draft-metadata.store";
import { useStep0IdentityStore } from "./use-step0-identity.store";
import { useStep1StructureStore } from "./use-step1-structure.store";
import { useStep2LayoutStore } from "./use-step2-layout.store";
import { useStep3ThemeStore } from "./use-step3-theme.store";
import { useStep4ContentStore } from "./use-step4-content.store";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import { useWorkspaceStore } from "@/shared/lib/stores/use-workspace.store";

interface CampaignDraftStoreState {
  isLoading: boolean;
  isSyncing: boolean;
  isHydrated: boolean;
}

interface CampaignDraftStoreActions {
  initializeDraft: () => Promise<void>;
  triggerDebouncedSave: () => void;
  deleteCurrentDraft: () => Promise<void>;
  resetDraft: () => void;
}

const initialState: CampaignDraftStoreState = {
  isLoading: true,
  isSyncing: false,
  isHydrated: false,
};

let debounceTimeout: NodeJS.Timeout | null = null;

const resetAllStores = () => {
  useDraftMetadataStore.getState().resetMetadata();
  useStep0IdentityStore.getState().resetStep0Data();
  useStep1StructureStore.getState().reset();
  useStep2LayoutStore.getState().resetLayout();
  useStep3ThemeStore.getState().resetThemeConfig();
  useStep4ContentStore.getState().resetContent();
};

const hydrateAllStores = (draft: CampaignDraft) => {
  useDraftMetadataStore.setState({
    ...useDraftMetadataStore.getState(),
    draftId: draft.draftId,
    baseCampaignId: draft.baseCampaignId,
    variantName: draft.variantName,
    seoKeywords: draft.seoKeywords,
    completedSteps: draft.completedSteps,
    updatedAt: draft.updatedAt,
  });
  useStep0IdentityStore.setState({
    producer: draft.producer,
    campaignType: draft.campaignType,
  });
  useStep1StructureStore.setState({
    headerConfig: draft.headerConfig,
    footerConfig: draft.footerConfig,
  });
  useStep2LayoutStore.setState({ layoutConfig: draft.layoutConfig });
  useStep3ThemeStore.setState({ themeConfig: draft.themeConfig });
  useStep4ContentStore.setState({ contentData: draft.contentData });
};

export const useCampaignDraftStore = create<
  CampaignDraftStoreState & CampaignDraftStoreActions
>((set) => ({
  ...initialState,
  initializeDraft: async () => {
    const traceId = logger.startTrace("initializeDraft");
    logger.startGroup("[DraftOrchestrator] Inicializando borrador...");
    set({ isLoading: true });

    const result = await getDraftAction();

    if (!result.success) {
      toast.error("Error al cargar el borrador", { description: result.error });
      logger.error("[DraftOrchestrator] Fallo la carga del borrador.", {
        error: result.error,
        traceId,
      });
      resetAllStores();
    } else if (result.data.draft) {
      logger.info("Hidratando stores desde borrador existente en DB.", {
        traceId,
      });
      hydrateAllStores(result.data.draft);
    } else {
      logger.info("Iniciando nuevo borrador limpio.", { traceId });
      resetAllStores();
    }
    set({ isLoading: false, isHydrated: true });
    logger.endGroup();
    logger.endTrace(traceId);
  },
  triggerDebouncedSave: () => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
      const traceId = logger.startTrace("debouncedSave");
      set({ isSyncing: true });

      const metadata = useDraftMetadataStore.getState();
      const identity = useStep0IdentityStore.getState();
      const activeWorkspaceId = useWorkspaceStore.getState().activeWorkspaceId;

      if (!metadata.draftId || !activeWorkspaceId) {
        set({ isSyncing: false });
        logger.warn(
          "[DraftOrchestrator] Guardado omitido: falta draftId o workspaceId.",
          { traceId, draftId: metadata.draftId, workspaceId: activeWorkspaceId }
        );
        logger.endTrace(traceId);
        return;
      }

      const assembledDraft = {
        ...metadata,
        ...identity,
        ...useStep1StructureStore.getState(),
        ...useStep2LayoutStore.getState(),
        ...useStep3ThemeStore.getState(),
        ...useStep4ContentStore.getState(),
      };

      const result = await saveDraftAction({
        ...assembledDraft,
        draftId: metadata.draftId,
        workspaceId: activeWorkspaceId,
      });

      if (result.success) {
        useDraftMetadataStore
          .getState()
          .setMetadata({ updatedAt: result.data.updatedAt });
        logger.success("[DraftOrchestrator] Borrador guardado exitosamente.", {
          traceId,
        });
      } else {
        toast.error("Error al guardar", { description: result.error });
        logger.error("[DraftOrchestrator] Fallo el guardado del borrador.", {
          error: result.error,
          traceId,
        });
      }
      set({ isSyncing: false });
      logger.endTrace(traceId);
    }, 1500);
  },
  deleteCurrentDraft: async () => {
    const draftId = useDraftMetadataStore.getState().draftId;
    if (!draftId) {
      toast.info("No hay un borrador activo para eliminar.");
      return;
    }
    const result = await deleteDraftAction(draftId);
    if (result.success) {
      resetAllStores();
      toast.success("Borrador eliminado con éxito.");
    } else {
      toast.error("Error al eliminar el borrador", {
        description: result.error,
      });
    }
  },
  resetDraft: () => {
    resetAllStores();
  },
}));
