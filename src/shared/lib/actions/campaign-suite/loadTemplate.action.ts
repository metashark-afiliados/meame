// RUTA: src/shared/lib/actions/campaign-suite/loadTemplate.action.ts
/**
 * @file loadTemplate.action.ts
 * @description Server Action de producción para cargar una plantilla específica,
 *              ahora con una consulta de seguridad compuesta para garantizar la propiedad.
 * @version 4.1.0 (Code Hygiene)
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
// Se elimina la importación no utilizada de 'zod'.

export async function loadTemplateAction(
  templateId: string
): Promise<ActionResult<CampaignTemplate>> {
  const traceId = logger.startTrace("loadTemplateAction_v4.1");
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
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        logger.warn(
          `[Action] Plantilla no encontrada o no pertenece al usuario.`,
          { templateId, userId: user.id, traceId }
        );
        throw new Error("Plantilla no encontrada o acceso denegado.");
      }
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
        "La plantilla no se pudo cargar. Puede que no exista o que no tengas permiso para acceder a ella.",
    };
  } finally {
    logger.endTrace(traceId);
  }
}
