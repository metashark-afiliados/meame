// RUTA: src/app/[locale]/creator/campaign-suite/page.tsx
/**
 * @file page.tsx
 * @description Punto de entrada a la SDC. Actúa como un "Server Shell" que
 *              obtiene las plantillas y las pasa al TemplateBrowser.
 *              v2.0.0 (Holistic Integrity Restoration): Restaura la integridad
 *              de la importación de la Server Action.
 * @version 2.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { getCampaignTemplatesAction } from "@/shared/lib/actions/campaign-suite";
import { TemplateBrowser } from "@/components/features/campaign-suite/TemplateBrowser";
import { DeveloperErrorDisplay } from "@/components/dev";
import { logger } from "@/shared/lib/logging";

export default async function CampaignSuiteLobbyPage() {
  logger.info(
    "[SDC Lobby] Renderizando página de selección de plantillas (v2.0)."
  );

  const templatesResult = await getCampaignTemplatesAction();

  if (!templatesResult.success) {
    // En producción, esto debería ser manejado de forma más elegante.
    return (
      <DeveloperErrorDisplay
        context="CampaignSuiteLobbyPage"
        errorMessage="No se pudieron cargar las plantillas de campaña."
        errorDetails={templatesResult.error}
      />
    );
  }

  return <TemplateBrowser templates={templatesResult.data} />;
}
