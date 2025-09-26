// RUTA: src/shared/hooks/campaign-suite/use-campaign-draft-context.store.ts
/**
 * @file use-campaign-draft-context.store.ts
 * @description Store Orquestador de élite para el ciclo de vida del borrador de campaña.
 *              Gestiona la carga, guardado y eliminación de borradores en la base de datos,
 *              y la hidratación de los stores atómicos.
 * @version 2.0.0 (Production-Ready Database Logic)
 * @author RaZ Podestá - MetaShark Tech
 */
import { create } from "zustand";
import { toast } from "sonner";
import { logger } from "@/shared/lib/logging";
import {
  getDraftAction,
  saveDraftAction,
} from "@/shared/lib/actions/campaign-suite/draft.actions";
import { deleteDraftAction } from "@/shared/lib/actions/campaign-suite/deleteDraft.action";

// Importación de todos los stores atómicos para controlarlos
import { useDraftMetadataStore } from "./use-draft-metadata.store";
import { useStep0IdentityStore } from "./use-step0-identity.store";
import { useStep1StructureStore } from "./use-step1-structure.store";
import { useStep2LayoutStore } from "./use-step2-layout.store";
import { useStep3ThemeStore } from "./use-step3-theme.store";
import { useStep4ContentStore } from "./use-step4-content.store";

interface DraftContextState {
  draftId: string | null;
  userId: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  initializeDraft: () => Promise<void>;
  saveDraftToDb: () => Promise<void>;
  deleteDraft: (id: string) => Promise<void>;
}

const initialState = {
  draftId: null,
  userId: null,
  isLoading: true,
  isSyncing: false,
};

export const useCampaignDraftContext = create<DraftContextState>(
  (set, get) => ({
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

        // Hidratar cada store atómico con su porción de datos
        useDraftMetadataStore.setState({
          draftId: draft.draftId,
          baseCampaignId: draft.baseCampaignId,
          variantName: draft.variantName,
          seoKeywords: draft.seoKeywords,
          completedSteps: draft.completedSteps,
          updatedAt: draft.updatedAt,
        });
        useStep0IdentityStore.setState({
          affiliateNetwork: draft.affiliateNetwork,
          affiliateUrl: draft.affiliateUrl,
        });
        useStep1StructureStore.setState({
          headerConfig: draft.headerConfig,
          footerConfig: draft.footerConfig,
        });
        useStep2LayoutStore.setState({ layoutConfig: draft.layoutConfig });
        useStep3ThemeStore.setState({ themeConfig: draft.themeConfig });
        useStep4ContentStore.setState({ contentData: draft.contentData });

        set({ draftId: draft.draftId, userId: draft.userId });
      } else {
        logger.warn(
          "No se encontró un borrador existente en la DB o hubo un error. Se iniciará un borrador nuevo."
        );
        if (!result.success)
          toast.error("No se pudo cargar el último borrador.", {
            description: result.error,
          });
      }

      set({ isLoading: false });
      logger.endGroup();
    },

    saveDraftToDb: async () => {
      if (get().isSyncing) return;
      set({ isSyncing: true });
      logger.trace(
        "[Orchestrator] Ensamblando borrador desde stores atómicos..."
      );

      const metadata = useDraftMetadataStore.getState();
      const identity = useStep0IdentityStore.getState();
      const structure = useStep1StructureStore.getState();
      const layout = useStep2LayoutStore.getState();
      const theme = useStep3ThemeStore.getState();
      const content = useStep4ContentStore.getState();

      if (!metadata.draftId) {
        logger.error(
          "[Orchestrator] Intento de guardado sin draftId. Abortando."
        );
        set({ isSyncing: false });
        return;
      }

      const assembledDraft = {
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
        logger.success(
          `[Orchestrator] Borrador ${result.data.draftId} sincronizado con la DB.`
        );
      } else {
        toast.error("Error al guardar el progreso.", {
          description: result.error,
        });
      }

      set({ isSyncing: false });
    },

    deleteDraft: async (id: string) => {
      logger.warn(`[Orchestrator] Solicitando eliminación del borrador: ${id}`);
      const result = await deleteDraftAction(id);

      if (result.success) {
        // Resetear todos los stores a su estado inicial
        useDraftMetadataStore.getState().resetMetadata();
        useStep0IdentityStore.getState().resetStep0Data();
        useStep1StructureStore.getState().reset();
        useStep2LayoutStore.getState().resetLayout();
        useStep3ThemeStore.getState().resetThemeConfig();
        useStep4ContentStore.getState().resetContent();

        set(initialState);
        toast.info("Borrador eliminado con éxito.");
      } else {
        toast.error("No se pudo eliminar el borrador.", {
          description: result.error,
        });
      }
    },
  })
);
