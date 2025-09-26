// RUTA: src/shared/lib/actions/campaign-suite/getCampaignTemplates.action.ts
/**
 * @file getCampaignTemplates.action.ts
 * @description Server Action de producción para obtener las plantillas de un usuario.
 * @version 2.0.0 (Supabase Production Ready)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { createServerClient } from "@/shared/lib/supabase/server";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import {
  CampaignTemplateSchema,
  type CampaignTemplate,
} from "@/shared/lib/schemas/campaigns/template.schema";
import { z } from "zod";

export async function getCampaignTemplatesAction(): Promise<
  ActionResult<CampaignTemplate[]>
> {
  const traceId = logger.startTrace("getCampaignTemplates_v2.0");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logger.warn("[Action] Intento no autorizado de obtener plantillas.", {
      traceId,
    });
    return { success: false, error: "auth_required" };
  }

  logger.info(`[Action] Solicitando plantillas para el usuario: ${user.id}`);

  try {
    const { data: templates, error } = await supabase
      .from("campaign_templates")
      .select("*")
      .eq("user_id", user.id) // <-- VULNERABILIDAD CORREGIDA
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // Validamos la respuesta de la DB contra nuestro schema de Zod
    const validatedTemplates = z.array(CampaignTemplateSchema).parse(templates);

    logger.success(
      `Se recuperaron ${validatedTemplates.length} plantillas para el usuario.`,
      { traceId }
    );
    return { success: true, data: validatedTemplates };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("Fallo crítico durante la obtención de plantillas.", {
      error: errorMessage,
      traceId,
    });
    return {
      success: false,
      error: `No se pudieron cargar las plantillas: ${errorMessage}`,
    };
  } finally {
    logger.endTrace(traceId);
  }
}
