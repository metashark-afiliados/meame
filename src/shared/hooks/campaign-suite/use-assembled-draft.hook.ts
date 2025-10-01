// RUTA: src/shared/lib/hooks/campaign-suite/use-assembled-draft.hook.ts
/**
 * @file use-assembled-draft.hook.ts
 * @description Hook soberano y agregador de estado. Ensambla el borrador de
 *              campaña completo desde los stores atómicos de Zustand.
 * @version 1.1.0 (Type Contract Restoration)
 *@author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useMemo } from "react";
import { logger } from "@/shared/lib/logging";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import { useDraftMetadataStore } from "./use-draft-metadata.store";
import { useStep0IdentityStore } from "./use-step0-identity.store";
import { useStep1StructureStore } from "./use-step1-structure.store";
import { useStep2LayoutStore } from "./use-step2-layout.store";
import { useStep3ThemeStore } from "./use-step3-theme.store";
import { useStep4ContentStore } from "./use-step4-content.store";

/**
 * @function useAssembledDraft
 * @description Un hook que se suscribe a todos los stores atómicos de la SDC
 *              y devuelve un objeto `CampaignDraft` completo y memoizado.
 * @returns {CampaignDraft} El estado completo y ensamblado del borrador.
 */
export function useAssembledDraft(): CampaignDraft {
  logger.trace("[useAssembledDraft] Hook de ensamblaje invocado.");

  // 1. Suscripción a todos los stores atómicos
  const metadata = useDraftMetadataStore();
  const identity = useStep0IdentityStore();
  const structure = useStep1StructureStore();
  const layout = useStep2LayoutStore();
  const theme = useStep3ThemeStore();
  const content = useStep4ContentStore();

  // 2. Ensamblaje memoizado del borrador
  const assembledDraft = useMemo((): CampaignDraft => {
    const traceId = logger.startTrace("assembleDraftFromStores");
    logger.traceEvent(
      traceId,
      "Dependencias de stores cambiaron. Re-ensamblando borrador..."
    );

    const draft: CampaignDraft = {
      // Metadata
      draftId: metadata.draftId,
      baseCampaignId: metadata.baseCampaignId,
      variantName: metadata.variantName,
      seoKeywords: metadata.seoKeywords,
      completedSteps: metadata.completedSteps,
      updatedAt: metadata.updatedAt,
      // Step 0
      producer: identity.producer,
      campaignType: identity.campaignType,
      // Step 1
      headerConfig: structure.headerConfig,
      footerConfig: structure.footerConfig,
      // Step 2
      layoutConfig: layout.layoutConfig,
      // Step 3
      themeConfig: theme.themeConfig,
      // Step 4
      contentData: content.contentData,
      // --- [INICIO DE CORRECCIÓN DE CONTRATO (TS2353)] ---
      // La propiedad 'step' ha sido eliminada para cumplir con el tipo CampaignDraft.
      // --- [FIN DE CORRECCIÓN DE CONTRATO] ---
    };

    logger.success("[useAssembledDraft] Borrador re-ensamblado.", { traceId });
    logger.endTrace(traceId);
    return draft;
  }, [metadata, identity, structure, layout, theme, content]);

  return assembledDraft;
}
