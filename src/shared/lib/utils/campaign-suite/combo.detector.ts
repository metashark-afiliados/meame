// RUTA: app/[locale]/(dev)/dev/campaign-suite/_utils/combo.detector.ts
/**
 * @file combo.detector.ts
 * @description Motor de lógica pura para la detección de Combos Estratégicos.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import {
  strategicCombos,
  type StrategicCombo,
} from "@/shared/lib/config/strategic-combos.config";
import type { SectionName } from "@/shared/lib/config/sections.config";
import type { LayoutConfig } from "@/shared/lib/types/campaigns/draft.types";

/**
 * @function detectStrategicCombos
 * @description Analiza el layout actual y devuelve cualquier combo estratégico que se haya formado.
 * @param {LayoutConfig} layout - El layout actual de la campaña.
 * @param {SectionName} newSection - La sección que se acaba de añadir.
 * @returns {StrategicCombo | null} El combo detectado o null si no se ha formado ninguno.
 */
export function detectStrategicCombos(
  layout: LayoutConfig,
  newSection: SectionName
): StrategicCombo | null {
  const currentSectionNames = layout.map((section) => section.name);

  for (const combo of strategicCombos) {
    // El combo solo se puede activar si la nueva sección es la ÚLTIMA del combo.
    if (combo.sections[combo.sections.length - 1] !== newSection) {
      continue;
    }

    // Verifica si las secciones requeridas para el combo existen en el layout.
    const hasAllSections = combo.sections.every((requiredSection) =>
      currentSectionNames.includes(requiredSection)
    );

    if (hasAllSections) {
      return combo;
    }
  }

  return null;
}
