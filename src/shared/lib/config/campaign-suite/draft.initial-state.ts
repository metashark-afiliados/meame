// Ruta correcta: src/shared/lib/config/campaign-suite/draft.initial-state.ts
/**
 * @file draft.initial-state.ts
 * @description SSoT para el estado inicial del borrador de campaña.
 * @version 4.1.0 (Holistic Integrity & FSD Alignment - Re-validated)
 * @author RaZ Podestá - MetaShark Tech
 */
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";

export const initialCampaignDraftState: CampaignDraft = {
  draftId: null,
  step: 0,
  completedSteps: [],
  baseCampaignId: null,
  variantName: null,
  seoKeywords: null,
  affiliateNetwork: null,
  affiliateUrl: null,
  headerConfig: { useHeader: true, componentName: null, logoPath: null },
  footerConfig: { useFooter: true, componentName: null },
  layoutConfig: [],
  themeConfig: {
    colorPreset: null,
    fontPreset: null,
    radiusPreset: null,
    themeOverrides: {},
  },
  contentData: {},
  updatedAt: new Date(0).toISOString(),
};
// Ruta correcta: src/shared/lib/config/campaign-suite/draft.initial-state.ts
