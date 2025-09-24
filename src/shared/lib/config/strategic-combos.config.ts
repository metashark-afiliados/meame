// Ruta correcta: src/shared/lib/config/strategic-combos.config.ts
/**
 * @file strategic-combos.config.ts
 * @description SSoT para la definición de los Combos Estratégicos en la SDC.
 *              v2.0.0 (Type Safety Fix): Se alinean los nombres de las secciones
 *              con la SSoT de `sections.config.ts`, resolviendo todos los errores
 *              de tipo TS2322 y garantizando la integridad del contrato.
 * @version 2.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import type { SectionName } from "./sections.config";

export interface StrategicCombo {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: ReadonlyArray<SectionName>;
}

export const strategicCombos: readonly StrategicCombo[] = [
  {
    id: "lead-magnet-basic",
    name: "Combo: Imán de Leads",
    description: "¡Perfecto para capturar el interés y convertir!",
    icon: "Magnet",
    // --- [INICIO DE CORRECCIÓN DE CONTRATO] ---
    sections: ["Hero", "FeaturesSection", "OrderSection"],
    // --- [FIN DE CORRECCIÓN DE CONTRATO] ---
  },
  {
    id: "social-proof-power",
    name: "Combo: Prueba Social",
    description: "¡Genera confianza mostrando testimonios!",
    icon: "Users",
    // --- [INICIO DE CORRECCIÓN DE CONTRATO] ---
    sections: ["Hero", "TestimonialGrid", "OrderSection"],
    // --- [FIN DE CORRECCIÓN DE CONTRATO] ---
  },
  {
    id: "knowledge-authority",
    name: "Combo: Autoridad",
    description: "¡Establece tu experticia y luego convierte!",
    icon: "BookMarked",
    // --- [INICIO DE CORRECCIÓN DE CONTRATO] ---
    sections: ["Hero", "FaqAccordion", "OrderSection"],
    // --- [FIN DE CORRECCIÓN DE CONTRATO] ---
  },
] as const;
// Ruta correcta: src/shared/lib/config/strategic-combos.config.ts
