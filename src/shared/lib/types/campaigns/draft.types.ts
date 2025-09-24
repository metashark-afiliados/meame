// RUTA: shared/lib/types/campaigns/draft.types.ts
/**
 * @file draft.types.ts
 * @description SSoT para los contratos de tipos del borrador de campaña y su estado en Zustand.
 *              v4.1.0 (Module Load Observability): Se añade un log de traza
 *              al inicio del módulo para confirmar su carga, cumpliendo con el
 *              Pilar III de Observabilidad.
 * @version 4.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import type { z } from "zod";
import type {
  HeaderConfigSchema,
  FooterConfigSchema,
  LayoutConfigSchema,
  ThemeConfigSchema,
  ContentDataSchema,
} from "@/shared/lib/schemas/campaigns/draft.parts.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging"; // Importa el logger

// --- INICIO DE MEJORA: OBSERVABILIDAD DE CARGA DE MÓDULO ---
logger.trace(
  "[draft.types.ts] Módulo de tipos de borrador de campaña cargado y listo para usar."
);
// --- FIN DE MEJORA: OBSERVABILIDAD DE CARGA DE MÓDULO ---

export type HeaderConfig = z.infer<typeof HeaderConfigSchema>;
export type FooterConfig = z.infer<typeof FooterConfigSchema>;
export type LayoutConfigItem = z.infer<typeof LayoutConfigSchema>[number];
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;
export type ContentData = z.infer<typeof ContentDataSchema>;

export interface CampaignDraft {
  draftId: string | null;
  step: number;
  completedSteps: number[];
  baseCampaignId: string | null;
  variantName: string | null;
  seoKeywords: string | null;
  affiliateNetwork: string | null;
  affiliateUrl: string | null;
  headerConfig: HeaderConfig;
  footerConfig: FooterConfig;
  layoutConfig: LayoutConfigItem[];
  themeConfig: ThemeConfig;
  contentData: ContentData;
  updatedAt: string;
}

export interface CampaignDraftState {
  draft: CampaignDraft;
  isLoading: boolean;
  isSyncing: boolean;
  initializeDraft: () => Promise<void>;
  updateDraft: (data: Partial<Omit<CampaignDraft, "step" | "draftId">>) => void;
  updateSectionContent: (
    sectionName: string,
    locale: Locale,
    field: string,
    value: unknown
  ) => void;
  setStep: (step: number) => void;
  deleteDraft: () => void;
  _debouncedSave: (draftToSave: CampaignDraft) => Promise<void>;
  _updateAndDebounce: (
    newDraftState: Partial<Omit<CampaignDraft, "draftId" | "step">>
  ) => void;
}
