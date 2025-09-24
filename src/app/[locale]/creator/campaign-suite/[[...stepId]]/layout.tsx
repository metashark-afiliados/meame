// RUTA: app/[locale]/creator/campaign-suite/[[...stepId]]/layout.tsx
/**
 * @file layout.tsx
 * @description Layout orquestador para la SDC, que ahora gestiona el flujo de
 *              selección de plantillas.
 * @version 2.0.0 (Template Browser Integration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client"; // Este layout ahora debe ser un Client Component para gestionar el estado

import React, { useState } from "react";
import { logger } from "@/shared/lib/logging";
import { CampaignSuiteWizard } from "@/components/features/campaign-suite/CampaignSuiteWizard";
import { TemplateBrowser } from "@/components/features/campaign-suite/TemplateBrowser/TemplateBrowser";
import { useCampaignDraftStore } from "@/shared/lib/stores/campaign-draft.store";
import type { CampaignTemplate } from "@/shared/lib/schemas/campaigns/template.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";

interface CampaignSuiteLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default function CampaignSuiteLayout({
  children, // children (page.tsx) ya no es necesario aquí, pero lo mantenemos por consistencia
  params,
}: CampaignSuiteLayoutProps): React.ReactElement {
  // Utilizamos un estado local para controlar si el proceso ha comenzado.
  const [isStarted, setIsStarted] = useState(false);
  const { applyTemplate, resetDraft } = useCampaignDraftStore();

  const handleSelectTemplate = (template: CampaignTemplate) => {
    logger.info(
      "[Layout] Plantilla seleccionada. Aplicando y comenzando asistente."
    );
    applyTemplate(template.draftData);
    setIsStarted(true);
  };

  const handleStartFromScratch = () => {
    logger.info(
      "[Layout] Empezando desde cero. Reiniciando borrador y comenzando asistente."
    );
    resetDraft(); // Asegura que empezamos con un borrador limpio.
    setIsStarted(true);
  };

  // El estado `isHydratedFromTemplate` de Zustand podría usarse aquí también,
  // pero un estado local es más simple para este control de flujo.

  if (!isStarted) {
    return (
      <TemplateBrowser
        onTemplateSelect={handleSelectTemplate}
        onStartFromScratch={handleStartFromScratch}
      />
    );
  }

  // Una vez que se ha iniciado el proceso, renderizamos el asistente.
  // El 'children' (page.tsx) es renderizado dentro del Wizard.
  return <main>{children}</main>; // El page.tsx renderizará el Wizard
}
