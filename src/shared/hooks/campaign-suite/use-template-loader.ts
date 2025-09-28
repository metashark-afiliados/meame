// RUTA: src/shared/hooks/campaign-suite/use-template-loader.ts
/**
 * @file use-template-loader.ts
 * @description Hook de élite para orquestar la carga de una plantilla y la
 *              hidratación de los stores atómicos de la SDC.
 * @version 2.0.0 (Atomic Store Hydration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { loadTemplateAction } from "@/shared/lib/actions/campaign-suite";
import { logger } from "@/shared/lib/logging";
import { useDraftMetadataStore } from "./use-draft-metadata.store";
import { useStep0IdentityStore } from "./use-step0-identity.store";
import { useStep1StructureStore } from "./use-step1-structure.store";
import { useStep2LayoutStore } from "./use-step2-layout.store";
import { useStep3ThemeStore } from "./use-step3-theme.store";
import { useStep4ContentStore } from "./use-step4-content.store";
import { generateDraftId } from "@/shared/lib/utils/campaign-suite/draft.utils";

export function useTemplateLoader(onLoadSuccess: () => void) {
  const [isPending, startTransition] = useTransition();

  const loadTemplate = (templateId: string) => {
    startTransition(async () => {
      logger.info(
        `[useTemplateLoader] Iniciando carga de plantilla: ${templateId}`
      );
      const result = await loadTemplateAction(templateId);

      if (result.success) {
        const { draftData } = result.data;

        logger.startGroup(
          `[useTemplateLoader] Hidratando stores con datos de plantilla...`
        );

        // Hidratar cada store atómico con su porción de datos
        useDraftMetadataStore.setState({
          baseCampaignId: draftData.baseCampaignId,
          variantName: `${draftData.variantName} (Copia)`, // Sugerir que es una copia
          seoKeywords: draftData.seoKeywords,
          completedSteps: [], // Resetear el progreso
          updatedAt: new Date().toISOString(),
          draftId: generateDraftId(draftData.baseCampaignId || "template"),
        });
        useStep0IdentityStore.setState({
          affiliateNetwork: draftData.affiliateNetwork,
          affiliateUrl: draftData.affiliateUrl,
        });
        useStep1StructureStore.setState({
          headerConfig: draftData.headerConfig,
          footerConfig: draftData.footerConfig,
        });
        useStep2LayoutStore.setState({ layoutConfig: draftData.layoutConfig });
        useStep3ThemeStore.setState({ themeConfig: draftData.themeConfig });
        useStep4ContentStore.setState({ contentData: draftData.contentData });

        logger.endGroup();
        toast.success("Plantilla cargada con éxito.", {
          description:
            "El asistente ha sido pre-configurado. ¡Ya puedes empezar a forjar!",
        });

        onLoadSuccess();
      } else {
        toast.error("Error al cargar la plantilla", {
          description: result.error,
        });
      }
    });
  };

  return { loadTemplate, isPending };
}
