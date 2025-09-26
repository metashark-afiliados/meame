// RUTA: src/shared/hooks/campaign-suite/use-campaign-draft-context.store.ts
/**
 * @file use-campaign-draft-context.store.ts
 * @description Store Orquestador de élite para el ciclo de vida del borrador de campaña.
 * @version 3.2.0 (Code Hygiene & Elite Compliance)
 * @author RaZ Podestá - MetaShark Tech
 */
import { create } from "zustand";
import { toast } from "sonner";
import { logger } from "@/shared/lib/logging";
import {
  getDraftAction,
  saveDraftAction,
  deleteDraftAction,
} from "@/shared/lib/actions/campaign-suite/draft.actions";
import { useDraftMetadataStore } from "./use-draft-metadata.store";
import { useStep0IdentityStore } from "./use-step0-identity.store";
import { useStep1StructureStore } from "./use-step1-structure.store";
import { useStep2LayoutStore } from "./use-step2-layout.store";
import { useStep3ThemeStore } from "./use-step3-theme.store";
import { useStep4ContentStore } from "./use-step4-content.store";
import type { CampaignDraftDb } from "@/shared/lib/schemas/campaigns/draft.schema";

interface DraftContextState {
  isLoading: boolean;
  isSyncing: boolean;
  initializeDraft: () => Promise<void>;
  triggerDebouncedSave: () => void;
  deleteCurrentDraft: () => Promise<void>;
}

const initialState = {
  isLoading: true,
  isSyncing: false,
};

let debounceTimer: NodeJS.Timeout;

export const useCampaignDraftContext = create<DraftContextState>((set) => ({
  ...initialState,

  initializeDraft: async () => {
    logger.startGroup("[Orchestrator] Inicializando borrador desde DB...");
    set({ isLoading: true });

    const result = await getDraftAction();

    if (result.success && result.data.draft) {
      const { draft } = result.data;
      logger.success(
        `Borrador encontrado: ${draft.draftId}. Hidratando stores...`
      );

      // --- REFACTORIZACIÓN DE HIGIENE DE CÓDIGO ---
      // Se accede directamente a las propiedades del objeto draft para evitar
      // la creación de variables no utilizadas.
      useDraftMetadataStore.setState({
        draftId: draft.draftId,
        baseCampaignId: draft.baseCampaignId,
        variantName: draft.variantName,
        seoKeywords: draft.seoKeywords,
        completedSteps: draft.completedSteps,
        updatedAt: draft.updatedAt,
      });

      useStep0IdentityStore.setState(draft);
      useStep1StructureStore.setState(draft);
      useStep2LayoutStore.setState(draft);
      useStep3ThemeStore.setState(draft);
      useStep4ContentStore.setState(draft);
      // --- FIN DE REFACTORIZACIÓN ---
    } else {
      logger.warn(
        "No se encontró borrador. Reseteando stores a estado inicial."
      );
      useDraftMetadataStore.getState().resetMetadata();
      useStep0IdentityStore.getState().resetStep0Data();
      useStep1StructureStore.getState().reset();
      useStep2LayoutStore.getState().resetLayout();
      useStep3ThemeStore.getState().resetThemeConfig();
      useStep4ContentStore.getState().resetContent();

      if (!result.success)
        toast.error("No se pudo cargar el último borrador.", {
          description: result.error,
        });
    }

    set({ isLoading: false });
    logger.endGroup();
  },

  triggerDebouncedSave: () => {
    clearTimeout(debounceTimer);
    set({ isSyncing: true });

    debounceTimer = setTimeout(async () => {
      logger.trace("[Orchestrator] Debounce finalizado. Guardando borrador...");

      const metadata = useDraftMetadataStore.getState();

      if (!metadata.draftId) {
        logger.error(
          "[Orchestrator] Intento de guardado sin draftId. Abortando."
        );
        set({ isSyncing: false });
        return;
      }

      const identity = useStep0IdentityStore.getState();
      const structure = useStep1StructureStore.getState();
      const layout = useStep2LayoutStore.getState();
      const theme = useStep3ThemeStore.getState();
      const content = useStep4ContentStore.getState();

      const assembledDraft: Omit<
        CampaignDraftDb,
        "createdAt" | "updatedAt" | "userId"
      > = {
        draftId: metadata.draftId,
        baseCampaignId: metadata.baseCampaignId,
        variantName: metadata.variantName,
        seoKeywords: metadata.seoKeywords,
        completedSteps: metadata.completedSteps,
        affiliateNetwork: identity.affiliateNetwork,
        affiliateUrl: identity.affiliateUrl,
        headerConfig: structure.headerConfig,
        footerConfig: structure.footerConfig,
        layoutConfig: layout.layoutConfig,
        themeConfig: theme.themeConfig,
        contentData: content.contentData,
      };

      const result = await saveDraftAction(assembledDraft);

      if (result.success) {
        useDraftMetadataStore.setState({ updatedAt: result.data.updatedAt });
      } else {
        toast.error("Error al guardar el progreso.", {
          description: result.error,
        });
      }
      set({ isSyncing: false });
    }, 1500);
  },

  deleteCurrentDraft: async () => {
    const draftId = useDraftMetadataStore.getState().draftId;
    if (!draftId) return;

    logger.warn(
      `[Orchestrator] Solicitando eliminación del borrador: ${draftId}`
    );
    const result = await deleteDraftAction(draftId);

    if (result.success) {
      useDraftMetadataStore.getState().resetMetadata();
      useStep0IdentityStore.getState().resetStep0Data();
      useStep1StructureStore.getState().reset();
      useStep2LayoutStore.getState().resetLayout();
      useStep3ThemeStore.getState().resetThemeConfig();
      useStep4ContentStore.getState().resetContent();
      toast.info("Borrador eliminado con éxito.");
    } else {
      toast.error("No se pudo eliminar el borrador.", {
        description: result.error,
      });
    }
  },
}));
