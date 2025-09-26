// RUTA: src/shared/hooks/campaign-suite/use-campaign-lifecycle.ts
/**
 * @file use-campaign-lifecycle.ts
 * @description Hook soberano de cliente para gestionar las acciones de ciclo de vida
 *              de la campaña (publicar, empaquetar, eliminar). Orquesta las
 *              transiciones de UI y la comunicación con las Server Actions.
 * @version 2.0.0 (Build Integrity Restoration & Elite Observability)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCampaignDraftStore } from "@/shared/lib/stores/campaign-draft.store";
import { routes } from "@/shared/lib/navigation";
import {
  publishCampaignAction,
  packageCampaignAction,
  deleteDraftAction, // <-- CORRECCIÓN DE IMPORTACIÓN
} from "@/shared/lib/actions/campaign-suite";
import { useCelebrationStore } from "@/shared/lib/stores/use-celebration.store";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import { logger } from "@/shared/lib/logging";

export function useCampaignLifecycle(locale: Locale, draft: CampaignDraft) {
  logger.trace("[useCampaignLifecycle] Hook inicializado v2.0.");
  const router = useRouter();
  const resetDraft = useCampaignDraftStore((s) => s.resetDraft);
  const celebrate = useCelebrationStore((s) => s.celebrate);
  const [isPublishing, startPublishTransition] = useTransition();
  const [isPackaging, startPackageTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const onPublish = () => {
    startPublishTransition(async () => {
      const traceId = logger.startTrace("onPublish_Lifecycle");
      logger.info("[Lifecycle] Iniciando publicación...", {
        traceId,
        draftId: draft.draftId,
      });
      const result = await publishCampaignAction(draft);
      if (result.success) {
        celebrate();
        toast.success("¡Campaña Publicada!", {
          description: `La variante con ID ${result.data.variantId} está ahora en vivo.`,
        });
        logger.success("[Lifecycle] Publicación exitosa.", { traceId });
      } else {
        toast.error("Fallo en la Publicación", { description: result.error });
        logger.error("[Lifecycle] Fallo en la publicación.", {
          traceId,
          error: result.error,
        });
      }
      logger.endTrace(traceId);
    });
  };

  const onPackage = () => {
    startPackageTransition(async () => {
      const traceId = logger.startTrace("onPackage_Lifecycle");
      logger.info("[Lifecycle] Iniciando empaquetado...", {
        traceId,
        draftId: draft.draftId,
      });
      const result = await packageCampaignAction(draft);
      if (result.success) {
        toast.info("Descarga iniciada", {
          description: "Tu paquete .zip se está descargando.",
        });
        window.open(result.data.downloadUrl, "_blank");
        logger.success("[Lifecycle] Empaquetado exitoso.", { traceId });
      } else {
        toast.error("Fallo en el Empaquetado", { description: result.error });
        logger.error("[Lifecycle] Fallo en el empaquetado.", {
          traceId,
          error: result.error,
        });
      }
      logger.endTrace(traceId);
    });
  };

  const onDelete = () => {
    startDeleteTransition(async () => {
      const traceId = logger.startTrace("onDelete_Lifecycle");
      if (!draft.draftId) {
        logger.warn("[Lifecycle] Intento de eliminación sin draftId.", {
          traceId,
        });
        toast.error("Error", {
          description: "No se puede eliminar un borrador sin ID.",
        });
        logger.endTrace(traceId);
        return;
      }
      logger.warn("[Lifecycle] Iniciando eliminación de borrador...", {
        traceId,
        draftId: draft.draftId,
      });
      await deleteDraftAction(draft.draftId);
      resetDraft();
      toast.info("Borrador eliminado.");
      router.push(routes.creatorCampaignSuite.path({ locale }));
      router.refresh();
      logger.success("[Lifecycle] Eliminación de borrador completada.", {
        traceId,
      });
      logger.endTrace(traceId);
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
