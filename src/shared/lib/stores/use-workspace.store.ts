// RUTA: src/shared/lib/stores/use-workspace.store.ts
/**
 * @file use-workspace.store.ts
 * @description Store de Zustand y SSoT para gestionar el estado del workspace
 *              activo y su caché de recursos (plantillas).
 * @version 2.0.0 (Template Caching)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { logger } from "@/shared/lib/logging";
import type { Workspace } from "@/shared/lib/schemas/entities/workspace.schema";
import type { CampaignTemplate } from "@/shared/lib/schemas/campaigns/template.schema";

interface WorkspaceState {
  activeWorkspaceId: string | null;
  availableWorkspaces: Workspace[];
  templates: CampaignTemplate[]; // <-- NUEVO ESTADO PARA CACHÉ
  isLoadingTemplates: boolean; // <-- NUEVO ESTADO DE CARGA
}

interface WorkspaceActions {
  setActiveWorkspace: (workspaceId: string) => void;
  setAvailableWorkspaces: (workspaces: Workspace[]) => void;
  setTemplates: (templates: CampaignTemplate[]) => void; // <-- NUEVA ACCIÓN
  setLoadingTemplates: (isLoading: boolean) => void; // <-- NUEVA ACCIÓN
  clearWorkspaceState: () => void;
}

const initialState: WorkspaceState = {
  activeWorkspaceId: null,
  availableWorkspaces: [],
  templates: [], // <-- VALOR INICIAL
  isLoadingTemplates: true, // <-- VALOR INICIAL
};

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  persist(
    (set) => ({
      ...initialState,
      setActiveWorkspace: (workspaceId) => {
        logger.info(
          `[WorkspaceStore] Cambiando workspace activo a: ${workspaceId}. Invalidando caché de plantillas.`
        );
        set({
          activeWorkspaceId: workspaceId,
          templates: [],
          isLoadingTemplates: true,
        }); // Al cambiar de workspace, se limpia la caché de plantillas
      },
      setAvailableWorkspaces: (workspaces) => {
        set((state) => {
          const activeWorkspaceStillExists = workspaces.some(
            (ws) => ws.id === state.activeWorkspaceId
          );
          if (!state.activeWorkspaceId || !activeWorkspaceStillExists) {
            const newActiveId = workspaces[0]?.id || null;
            return {
              availableWorkspaces: workspaces,
              activeWorkspaceId: newActiveId,
              templates: [],
              isLoadingTemplates: true,
            };
          }
          return { availableWorkspaces: workspaces };
        });
      },
      setTemplates: (templates) => {
        logger.info(
          `[WorkspaceStore] Cacheando ${templates.length} plantillas.`
        );
        set({ templates, isLoadingTemplates: false });
      },
      setLoadingTemplates: (isLoading) => {
        set({ isLoadingTemplates: isLoading });
      },
      clearWorkspaceState: () => {
        logger.warn(
          "[WorkspaceStore] Limpiando estado del workspace (logout)."
        );
        set(initialState);
      },
    }),
    {
      name: "workspace-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
