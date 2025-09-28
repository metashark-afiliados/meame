// RUTA: src/shared/hooks/campaign-suite/use-campaign-draft-context.store.ts
/**
 * @file use-campaign-draft-context.store.ts
 * @description Store Orquestador de élite para el ciclo de vida del borrador de campaña.
 * @version 5.0.0 (Mock Logic Removed)
 * @author RaZ Podestá - MetaShark Tech
 */
import { create } from "zustand";
// ... (resto de importaciones sin cambios)

interface DraftContextState {
  isLoading: boolean;
  isSyncing: boolean;
  initializeDraft: (draftId?: string) => Promise<void>; // Modificado para aceptar un ID
  triggerDebouncedSave: () => void;
  deleteCurrentDraft: () => Promise<void>;
}

// ... (resto del store sin la función hydrateWithMockData)
