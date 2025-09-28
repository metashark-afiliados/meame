// RUTA: src/shared/hooks/campaign-suite/use-campaign-lifecycle.ts
/**
 * @file use-campaign-lifecycle.ts
 * @description Hook soberano para gestionar el ciclo de vida de la campaña.
 *              Ahora es consciente del contexto del workspace.
 * @version 3.0.0 (Workspace-Aware)
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
  deleteDraftAction,
} from "@/shared/lib/actions/campaign-suite";
import { useCelebrationStore } from "@/shared/lib/stores/use-celebration.store";
import { useWorkspaceStore } from "@/shared/lib/stores/use-workspace.store"; // <-- IMPORTACIÓN DEL STORE
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import { logger } from "@/shared/lib/logging";

export function useCampaignLifecycle(locale: Locale, draft: CampaignDraft) {
  logger.trace(
    "[useCampaignLifecycle] Hook inicializado v3.0 (Workspace-Aware)."
  );
  const router = useRouter();
  const resetDraft = useCampaignDraftStore((s) => s.resetDraft);
  const celebrate = useCelebrationStore((s) => s.celebrate);
  const [isPublishing, startPublishTransition] = useTransition();
  const [isPackaging, startPackageTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId
  ); // <-- OBTENER WORKSPACE ACTIVO

  const onPublish = () => {
    startPublishTransition(async () => {
      // Futuro: Pasar activeWorkspaceId a publishCampaignAction
      const result = await publishCampaignAction(draft);
      if (result.success) {
        celebrate();
        toast.success("¡Campaña Publicada!", {
          description: `La variante con ID ${result.data.variantId} está ahora en vivo.`,
        });
      } else {
        toast.error("Fallo en la Publicación", { description: result.error });
      }
    });
  };

  const onPackage = () => {
    startPackageTransition(async () => {
      // Futuro: Pasar activeWorkspaceId a packageCampaignAction
      const result = await packageCampaignAction(draft);
      if (result.success) {
        toast.info("Descarga iniciada", {
          description: "Tu paquete .zip se está descargando.",
        });
        window.open(result.data.downloadUrl, "_blank");
      } else {
        toast.error("Fallo en el Empaquetado", { description: result.error });
      }
    });
  };

  const onDelete = () => {
    startDeleteTransition(async () => {
      if (!draft.draftId) {
        toast.error("Error", {
          description: "No se puede eliminar un borrador sin ID.",
        });
        return;
      }
      // La acción deleteDraftAction ahora es consciente del workspace por RLS
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
