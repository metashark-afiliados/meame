// RUTA: shared/lib/actions/campaign-suite/loadTemplate.action.ts
/**
 * @file loadTemplate.action.ts
 * @description Server Action de producción para cargar una plantilla específica.
 * @version 3.0.0 (Supabase Production Ready)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { createServerClient } from "@/shared/lib/supabase/server";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import {
  CampaignTemplateSchema,
  type CampaignTemplate,
} from "@/shared/lib/schemas/campaigns/template.schema";
import { logger } from "@/shared/lib/logging";

export async function loadTemplateAction(
  templateId: string
): Promise<ActionResult<CampaignTemplate>> {
  const traceId = logger.startTrace("loadTemplateAction_v3.0");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logger.warn("[Action] Intento no autorizado de cargar plantilla.", {
      traceId,
    });
    return { success: false, error: "auth_required" };
  }

  logger.info(
    `[Action] Cargando plantilla ${templateId} para usuario ${user.id}`
  );

  try {
    const { data: template, error } = await supabase
      .from("campaign_templates")
      .select("*")
      .eq("id", templateId)
      .single(); // .single() devuelve un error si no se encuentra exactamente un resultado

    if (error) {
      throw new Error(error.message);
    }

    const validatedTemplate = CampaignTemplateSchema.parse(template);

    logger.success(`Plantilla ${templateId} cargada y validada con éxito.`, {
      traceId,
    });
    return { success: true, data: validatedTemplate };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("No se pudo cargar la plantilla seleccionada.", {
      error: errorMessage,
      traceId,
    });
    return {
      success: false,
      error:
        "La plantilla no se pudo cargar o no tienes permiso para acceder a ella.",
    };
  } finally {
    logger.endTrace(traceId);
  }
}
