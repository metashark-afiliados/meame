// RUTA: src/shared/lib/actions/campaign-suite/saveAsTemplate.action.ts
/**
 * @file saveAsTemplate.action.ts
 * @description Server Action para persistir un borrador de campaña como una plantilla reutilizable.
 * @version 2.2.0 (Holistic Contract & Type Safety Alignment)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { logger } from "@/shared/lib/logging";
import { connectToDatabase } from "@/shared/lib/mongodb";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import {
  CampaignTemplateSchema,
  type CampaignTemplate,
} from "@/shared/lib/schemas/campaigns/template.schema";
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
  const traceId = logger.startTrace("saveAsTemplateAction_v2.2");
  logger.info("[Action] Guardando borrador como plantilla v2.2...", {
    name,
    draftId: draft.draftId,
  });

  try {
    const inputValidation = InputSchema.safeParse({ name, description });
    if (!inputValidation.success) {
      logger.warn("[Action] Validación de entrada fallida.", {
        errors: inputValidation.error.flatten(),
        traceId,
      });
      return {
        success: false,
        error: "Los datos proporcionados son inválidos.",
      };
    }

    const draftValidation = CampaignDraftDataSchema.safeParse(draft);
    if (!draftValidation.success) {
      logger.error("[Action] El borrador a guardar es inválido.", {
        errors: draftValidation.error.flatten(),
        traceId,
      });
      return { success: false, error: "El borrador contiene datos corruptos." };
    }

    const now = new Date();
    const templateDocument: CampaignTemplate = {
      id: createId(),
      name: inputValidation.data.name,
      description: inputValidation.data.description || undefined,
      createdAt: now,
      // --- [INICIO DE CORRECCIÓN DE CONTRATO] ---
      // El campo 'sourceCampaignId' ahora es parte del contrato y se puebla correctamente.
      sourceCampaignId: draft.baseCampaignId || "unknown",
      // --- [FIN DE CORRECCIÓN DE CONTRATO] ---
      draftData: draftValidation.data,
    };

    const finalValidation = CampaignTemplateSchema.safeParse(templateDocument);
    if (!finalValidation.success) {
      // Esta es una guardia de seguridad interna, no debería fallar si la lógica es correcta.
      throw new Error(
        `El documento de plantilla final no superó la validación: ${finalValidation.error.message}`
      );
    }

    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection<CampaignTemplate>("campaign_templates");
    await collection.insertOne(finalValidation.data);

    logger.success("[Action] Plantilla guardada exitosamente.", {
      templateId: templateDocument.id,
      traceId,
    });

    return { success: true, data: { templateId: templateDocument.id } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[Action] Fallo crítico al guardar la plantilla.", {
      error: errorMessage,
      traceId,
    });
    return {
      success: false,
      error: "No se pudo conectar con el servicio de base de datos.",
    };
  } finally {
    logger.endTrace(traceId);
  }
}
