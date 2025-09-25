// RUTA: src/components/features/campaign-suite/Step5_Management/Step5Client.tsx
/**
 * @file Step5Client.tsx
 * @description Orquestador de cliente para el Paso 5. Gestiona la lógica y el estado.
 * @version 1.1.0 (Sovereign Path Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useMemo } from "react";
import { toast } from "sonner";
import { logger } from "@/shared/lib/logging";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { z } from "zod";
import type { Step5ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step5.schema";
import { useCampaignDraft } from "@/shared/hooks/campaign-suite/use-campaign-draft";
import { useCampaignLifecycle } from "@/shared/hooks/campaign-suite/use-campaign-lifecycle";
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import {
  publishCampaignAction,
  packageCampaignAction,
} from "@/shared/lib/actions/campaign-suite";
import { useCampaignTemplates } from "@/shared/hooks/campaign-suite/use-campaign-templates";
// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
import { validateDraftForLaunch } from "@/shared/lib/utils/campaign-suite/draft.validator";
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---
import { Step5Form } from "./Step5Form";
import { DigitalConfetti } from "@/components/ui/DigitalConfetti";

type Content = z.infer<typeof Step5ContentSchema>;

interface Step5ClientProps {
  locale: Locale;
  stepContent: Content;
}

export function Step5Client({
  locale,
  stepContent,
}: Step5ClientProps): React.ReactElement {
  const { draft } = useCampaignDraft();
  const { goToPrevStep } = useWizard();
  const {
    onDelete,
    isPublishing,
    startPublishTransition,
    isPackaging,
    startPackageTransition,
    isDeleting,
  } = useCampaignLifecycle(locale);
  const { onSaveAsTemplate, isSavingTemplate } = useCampaignTemplates();

  const checklistItems = useMemo(() => validateDraftForLaunch(draft), [draft]);
  const isLaunchReady = useMemo(
    () => checklistItems.every((item) => item.isCompleted),
    [checklistItems]
  );

  const onPublish = () => {
    logger.info("[Step5Client] Iniciando transición de publicación.");
    startPublishTransition(async () => {
      const result = await publishCampaignAction(draft);
      if (result.success) {
        toast.success("¡Campaña publicada con éxito!", {
          description: `La variante ${result.data.variantId} está ahora activa.`,
        });
        // En una app real, el manejo de efectos como el confeti
        // se haría a través de un proveedor de contexto de notificaciones.
        // Por ahora, lo simulamos así para demostrar la capacidad.
        const confettiActivator = document.createElement("div");
        document.body.appendChild(confettiActivator);
        const root = require("react-dom/client").createRoot(confettiActivator);
        root.render(
          <DigitalConfetti
            isActive={true}
            onComplete={() => {
              root.unmount();
              confettiActivator.remove();
            }}
          />
        );
      } else {
        toast.error("Fallo al publicar la campaña", {
          description: result.error,
        });
      }
    });
  };

  const onPackage = () => {
    logger.info("[Step5Client] Iniciando transición de empaquetado.");
    startPackageTransition(async () => {
      const result = await packageCampaignAction(draft);
      if (result.success) {
        toast.success("¡Paquete .zip generado con éxito!", {
          description: "La descarga comenzará en breve.",
          action: {
            label: "Descargar Ahora",
            onClick: () => window.open(result.data.downloadUrl, "_blank"),
          },
        });
        window.open(result.data.downloadUrl, "_blank");
      } else {
        toast.error("Fallo al generar el paquete", {
          description: result.error,
        });
      }
    });
  };

  return (
    <Step5Form
      draft={draft}
      checklistItems={checklistItems}
      content={stepContent}
      onBack={goToPrevStep}
      onPublish={onPublish}
      onPackage={onPackage}
      onConfirmDelete={onDelete}
      onSaveAsTemplate={onSaveAsTemplate}
      isPublishing={isPublishing}
      isPackaging={isPackaging}
      isDeleting={isDeleting}
      isSavingTemplate={isSavingTemplate}
      isLaunchReady={isLaunchReady}
    />
  );
}
