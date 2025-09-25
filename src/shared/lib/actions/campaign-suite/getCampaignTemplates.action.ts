// RUTA: shared/lib/actions/campaign-suite/getCampaignTemplates.action.ts
/**
 * @file getCampaignTemplates.action.ts
 * @description Server Action para obtener todas las plantillas de campaña disponibles.
 * @version 1.1.0 (Code Hygiene)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import type { CampaignTemplate } from "@/shared/lib/schemas/campaigns/template.schema";

// Datos mockeados para desarrollo hasta que la conexión a la BD esté activa.
const MOCK_TEMPLATES: CampaignTemplate[] = [
  /* ... (datos de plantillas mockeadas) ... */
];

export async function getCampaignTemplatesAction(): Promise<
  ActionResult<CampaignTemplate[]>
> {
  logger.info("[Action] Solicitando lista de plantillas de campaña...");

  try {
    // Lógica con datos mockeados para desarrollo
    await new Promise((resolve) => setTimeout(resolve, 750)); // Simular latencia de red
    logger.success(
      `Se recuperaron ${MOCK_TEMPLATES.length} plantillas (mock).`
    );
    return { success: true, data: MOCK_TEMPLATES };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "Fallo crítico durante la obtención de plantillas de campaña.",
      { error: errorMessage }
    );
    return {
      success: false,
      error: `No se pudieron cargar las plantillas: ${errorMessage}`,
    };
  }
}
// RUTA: shared/lib/actions/campaign-suite/getCampaignTemplates.action.ts
