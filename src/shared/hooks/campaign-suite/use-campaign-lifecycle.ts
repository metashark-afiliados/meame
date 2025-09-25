// RUTA: src/shared/hooks/campaign-suite/use-campaign-lifecycle.ts
/**
 * @file use-campaign-lifecycle.ts
 * @description Hook atómico para gestionar las acciones de ciclo de vida de la campaña.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCampaignDraftStore } from "@/shared/lib/stores/campaign-draft.store";
import { routes } from "@/shared/lib/navigation";
import { publishCampaignAction, packageCampaignAction } from "@/shared/lib/actions/campaign-suite";
import { deleteDraftAction } from "@/shared/lib/actions/campaign-suite/deleteDraft.action";
import { useCelebrationStore } from "@/shared/lib/stores/use-celebration.store";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";

export function useCampaignLifecycle(locale: Locale, draft: CampaignDraft) {
  const router = useRouter();
  const resetDraft = useCampaignDraftStore((s) => s.resetDraft);
  const celebrate = useCelebrationStore((s) => s.celebrate);
  const [isPublishing, startPublishTransition] = useTransition();
  const [isPackaging, startPackageTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const onPublish = () => {
    startPublishTransition(async () => {
      const result = await publishCampaignAction(draft);
      if (result.success) {
        celebrate();
        toast.success("¡Campaña Publicada!", { description: `La variante con ID ${result.data.variantId} está ahora en vivo.` });
      } else {
        toast.error("Fallo en la Publicación", { description: result.error });
      }
    });
  };

  const onPackage = () => {
     startPackageTransition(async () => {
      const result = await packageCampaignAction(draft);
      if (result.success) {
        toast.info("Descarga iniciada", { description: "Tu paquete .zip se está descargando."});
        window.open(result.data.downloadUrl, '_blank');
      } else {
        toast.error("Fallo en el Empaquetado", { description: result.error });
      }
    });
  };

  const onDelete = () => {
    startDeleteTransition(async () => {
      if (!draft.draftId) return;
      await deleteDraftAction(draft.draftId);
      resetDraft();
      toast.info("Borrador eliminado.");
      router.push(routes.creatorCampaignSuite.path({ locale }));
      router.refresh();
    });
  };

  return {
    onPublish,
    onPackage,
    onDelete,
    isPublishing,
    isPackaging,
    isDeleting,
  };
}
