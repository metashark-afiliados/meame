// app/[locale]/(dev)/dev/campaign-suite/_context/FocusContext.ts
/**
 * @file FocusContext.ts
 * @description Store de Zustand para gestionar el estado de foco global
 *              entre el editor de contenido y el lienzo de previsualización (EDVI).
 *              Es la SSoT para saber qué elemento de la UI tiene el foco del usuario.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { create } from "zustand";

/**
 * @interface FocusState
 * @description Define el contrato de datos y acciones para el store de foco.
 */
interface FocusState {
  /** El `name` de la sección que actualmente tiene el foco. */
  focusedSection: string | null;
  /** El `name` del campo específico dentro de la sección que tiene el foco. */
  focusedField: string | null;
  /** Acción para establecer el estado de foco actual. */
  setFocus: (section: string | null, field: string | null) => void;
  /** Acción para limpiar el estado de foco. */
  clearFocus: () => void;
}

/**
 * @const useFocusStore
 * @description Hook para acceder e interactuar con el estado de foco global.
 */
export const useFocusStore = create<FocusState>((set) => ({
  focusedSection: null,
  focusedField: null,
  setFocus: (section, field) => {
    // console.log(`[FocusContext] Foco establecido en: ${section}.${field}`); // Descomentar para depuración intensa
    set({ focusedSection: section, focusedField: field });
  },
  clearFocus: () => {
    // console.log('[FocusContext] Foco limpiado.'); // Descomentar para depuración intensa
    set({ focusedSection: null, focusedField: null });
  },
}));
// app/[locale]/(dev)/dev/campaign-suite/_context/FocusContext.ts
