// Ruta correcta: src/shared/hooks/campaign-suite/use-campaign-lifecycle.ts
/**
 * @file use-campaign-lifecycle.ts
 * @description Hook atómico para gestionar los estados de transición de las
 *              acciones de ciclo de vida de la campaña.
 * @version 2.0.0 (Holistic Integrity & SSoT Alignment)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCampaignDraft } from "@/shared/hooks/campaign-suite/use-campaign-draft";
import { logger } from "@/shared/lib/logging";
import { routes } from "@/shared/lib/navigation";
import type { Locale } from "@/shared/lib/i18n/i18n.config";

export function useCampaignLifecycle(locale: Locale) {
  const { deleteDraft } = useCampaignDraft();
  const router = useRouter();
  const [isPublishing, startPublishTransition] = useTransition();
  const [isPackaging, startPackageTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const onDelete = () => {
    logger.warn("[Lifecycle Hook] Confirmada la eliminación del borrador.");
    startDeleteTransition(async () => {
      await deleteDraft();
      toast.info("Borrador eliminado. Reiniciando asistente.");
      // --- [INICIO DE CORRECCIÓN DE SSoT] ---
      // La ruta correcta para la creación en la SDC es 'creatorCampaignSuite'.
      router.push(routes.creatorCampaignSuite.path({ locale }));
      // --- [FIN DE CORRECCIÓN DE SSoT] ---
      router.refresh();
    });
  };

  return {
    onDelete,
    isPublishing,
    startPublishTransition,
    isPackaging,
    startPackageTransition,
    isDeleting,
  };
}
// Ruta correcta: src/shared/hooks/campaign-suite/use-campaign-lifecycle.ts
