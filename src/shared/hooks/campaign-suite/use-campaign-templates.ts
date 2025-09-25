// RUTA: src/shared/hooks/campaign-suite/use-campaign-templates.ts
/**
 * @file use-campaign-templates.ts
 * @description Hook atómico para encapsular la lógica de cliente de la gestión de plantillas.
 * @version 2.0.0 (Holistic Integrity & FSD Alignment)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { saveAsTemplateAction } from "@/shared/lib/actions/campaign-suite";
import { logger } from "@/shared/lib/logging";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";

export function useCampaignTemplates(draft: CampaignDraft) {
  const [isSavingTemplate, startSaveTransition] = useTransition();

  const onSaveAsTemplate = (name: string, description: string) => {
    logger.startGroup("[Templates Hook] Guardando como Plantilla");
    startSaveTransition(async () => {
      const result = await saveAsTemplateAction(draft, name, description);
      if (result.success) {
        toast.success("¡Plantilla guardada con éxito!", {
          description: `La plantilla "${name}" ha sido creada.`,
        });
      } else {
        toast.error("Fallo al guardar la plantilla", {
          description: result.error,
        });
      }
      logger.endGroup();
    });
  };

  return {
    onSaveAsTemplate,
    isSavingTemplate,
  };
}
