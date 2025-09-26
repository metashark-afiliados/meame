// RUTA: src/shared/lib/actions/raz-prompts/createPromptEntry.action.ts
/**
 * @file createPromptEntry.action.ts
 * @description Server Action de producción para crear una nueva entrada de prompt.
 * @version 5.0.0 (Production-Ready User Context)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { createId } from "@paralleldrive/cuid2";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { createServerClient } from "@/shared/lib/supabase/server"; // <-- IMPORTACIÓN CLAVE
import {
  RaZPromptsEntrySchema,
  type RaZPromptsEntry,
} from "@/shared/lib/schemas/raz-prompts/entry.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";

type CreatePromptInput = Pick<
  RaZPromptsEntry,
  "title" | "versions" | "tags" | "keywords"
>;

export async function createPromptEntryAction(
  input: CreatePromptInput
): Promise<ActionResult<{ promptId: string }>> {
  const traceId = logger.startTrace("createPromptEntry_v5.0");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- GUARDIA DE SEGURIDAD SOBERANA ---
  if (!user) {
    logger.warn("[Action] Intento no autorizado de crear prompt.", { traceId });
    return { success: false, error: "auth_required" };
  }

  logger.info(`[Action] Creando nuevo prompt para usuario: ${user.id}`, {
    traceId,
  });

  try {
    const now = new Date().toISOString();
    const newPromptId = createId();

    const promptDocument: RaZPromptsEntry = {
      ...input,
      aiService: input.tags.ai,
      promptId: newPromptId,
      userId: user.id, // <-- LÓGICA DE PRODUCCIÓN
      status: "pending_generation",
      createdAt: now,
      updatedAt: now,
    };

    const validation = RaZPromptsEntrySchema.safeParse(promptDocument);
    if (!validation.success) {
      logger.error("[createPromptEntry] Fallo de validación de Zod.", {
        error: validation.error.flatten(),
        traceId,
      });
      return { success: false, error: "Los datos del prompt son inválidos." };
    }

    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection<RaZPromptsEntry>("prompts");

    await collection.insertOne(validation.data);

    logger.success(
      `[createPromptEntry] Nuevo genoma de prompt creado con ID: ${newPromptId} por usuario: ${user.id}`
    );
    logger.endTrace(traceId);
    return { success: true, data: { promptId: newPromptId } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[createPromptEntry] Fallo crítico en la acción.", {
      error: errorMessage,
      traceId,
    });
    return { success: false, error: "No se pudo crear la entrada del prompt." };
  }
}
