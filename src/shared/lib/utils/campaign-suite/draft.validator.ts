// RUTA: app/[locale]/(dev)/dev/campaign-suite/_utils/draft.validator.ts
/**
 * @file draft.validator.ts
 * @description SSoT para la lógica de validación de un borrador de campaña
 *              antes de su publicación. Es una función pura y sin efectos secundarios.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import { sectionsConfig } from "@/shared/lib/config/sections.config";
import { defaultLocale } from "@/shared/lib/i18n/i18n.config";

export interface ChecklistItem {
  id: string;
  label: string;
  isCompleted: boolean;
  helpText: string;
}

/**
 * @function validateDraftForLaunch
 * @description Valida un borrador de campaña contra una serie de reglas de negocio.
 * @param {CampaignDraft} draft - El estado completo del borrador.
 * @returns {ChecklistItem[]} Un array de ítems del checklist con su estado de completitud.
 */
export function validateDraftForLaunch(draft: CampaignDraft): ChecklistItem[] {
  const checklist: ChecklistItem[] = [];

  // Regla 1: Identidad Básica Definida
  const isIdentityComplete = !!(
    draft.baseCampaignId &&
    draft.variantName &&
    draft.seoKeywords
  );
  checklist.push({
    id: "identity",
    label: "Identidad de la campaña definida",
    isCompleted: isIdentityComplete,
    helpText: "Asegúrate de haber completado todos los campos en el Paso 0.",
  });

  // Regla 2: Layout Configurado
  const isLayoutComplete = draft.layoutConfig.length > 0;
  checklist.push({
    id: "layout",
    label: "Layout de página compuesto",
    isCompleted: isLayoutComplete,
    helpText: "Añade al menos una sección en el Paso 2 para continuar.",
  });

  // Regla 3: Tema Visual Seleccionado
  const isThemeComplete = !!(
    draft.themeConfig.colorPreset &&
    draft.themeConfig.fontPreset &&
    draft.themeConfig.radiusPreset
  );
  checklist.push({
    id: "theme",
    label: "Tema visual seleccionado",
    isCompleted: isThemeComplete,
    helpText:
      "Selecciona una paleta de colores, tipografía y geometría en el Paso 3.",
  });

  // Regla 4: Contenido del Locale Principal Relleno
  let isContentComplete = isLayoutComplete;
  if (isLayoutComplete) {
    for (const section of draft.layoutConfig) {
      const sectionContent = draft.contentData[section.name]?.[defaultLocale];
      if (!sectionContent || Object.keys(sectionContent).length === 0) {
        isContentComplete = false;
        break;
      }
    }
  }
  checklist.push({
    id: "content",
    label: `Contenido para el idioma principal (${defaultLocale}) completo`,
    isCompleted: isContentComplete,
    helpText: `Asegúrate de rellenar el contenido para todas las secciones en el idioma por defecto (${defaultLocale}) en el Paso 4.`,
  });

  return checklist;
}
