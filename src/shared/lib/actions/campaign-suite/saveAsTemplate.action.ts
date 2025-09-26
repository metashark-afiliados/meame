// RUTA: src/shared/lib/actions/campaign-suite/saveAsTemplate.action.ts
/**
 * @file saveAsTemplate.action.ts
 * @description Server Action para persistir un borrador como plantilla en Supabase.
 * @version 3.1.0 (Type-Safe JSONB Insertion)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { z } from "zod";
import { createServerClient } from "@/shared/lib/supabase/server";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import { CampaignDraftDataSchema } from "@/shared/lib/schemas/campaigns/draft.schema";

const InputSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string(),
});

export async function saveAsTemplateAction(
  draft: CampaignDraft,
  name: string,
  description: string
): Promise<ActionResult<{ templateId: string }>> {
  const traceId = logger.startTrace("saveAsTemplateAction_v3.1");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Guardia de Resiliencia: Autenticación
  if (!user) {
    logger.warn("[Action] Intento no autorizado de guardar plantilla.", {
      traceId,
    });
    return { success: false, error: "auth_required" };
  }

  logger.info(
    `[Action] Guardando borrador como plantilla para usuario ${user.id}`,
    {
      name,
      draftId: draft.draftId,
      traceId,
    }
  );

  try {
    // 2. Guardia de Resiliencia: Validación de Entrada del Usuario
    const inputValidation = InputSchema.safeParse({ name, description });
    if (!inputValidation.success) {
      logger.warn("[Action] Validación de entrada de plantilla fallida.", {
        errors: inputValidation.error.flatten(),
        traceId,
      });
      return {
        success: false,
        error: "Los datos proporcionados para la plantilla son inválidos.",
      };
    }

    // 3. Guardia de Resiliencia: Integridad del Borrador
    const draftValidation = CampaignDraftDataSchema.safeParse(draft);
    if (!draftValidation.success) {
      logger.error(
        "[Action] El borrador a guardar como plantilla es inválido.",
        {
          errors: draftValidation.error.flatten(),
          traceId,
        }
      );
      return { success: false, error: "El borrador contiene datos corruptos." };
    }

    // 4. Lógica de Negocio: Construcción del Documento
    const templateData = {
      user_id: user.id,
      name: inputValidation.data.name,
      description: inputValidation.data.description || null,
      source_campaign_id: draft.baseCampaignId || "unknown",
      // --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: TIPO SEGURO] ---
      // Se elimina la aserción `as any`. El cliente de Supabase manejará
      // la serialización del objeto validado por Zod a jsonb.
      draft_data: draftValidation.data,
      // --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---
    };

    // 5. Interacción con la Base de Datos
    const { data, error } = await supabase
      .from("campaign_templates")
      .insert(templateData)
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    logger.success("[Action] Plantilla guardada exitosamente en Supabase.", {
      templateId: data.id,
      traceId,
    });

    return { success: true, data: { templateId: data.id } };
  } catch (error) {
    // 6. Guardia de Resiliencia: Captura de Errores de BD
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "[Action] Fallo crítico al guardar la plantilla en Supabase.",
      {
        error: errorMessage,
        traceId,
      }
    );
    return {
      success: false,
      error:
        "No se pudo conectar con el servicio de base de datos para guardar la plantilla.",
    };
  } finally {
    logger.endTrace(traceId);
  }
}
