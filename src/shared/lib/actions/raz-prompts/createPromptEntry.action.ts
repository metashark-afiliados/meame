// RUTA: src/shared/lib/actions/raz-prompts/createPromptEntry.action.ts
/**
 * @file createPromptEntry.action.ts
 * @description Server Action para crear una nueva entrada de prompt en la base de datos.
 * @version 4.0.0 (Creative Genome v4.0)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { createId } from "@paralleldrive/cuid2";
import { connectToDatabase } from "@/shared/lib/mongodb";
import {
  RaZPromptsEntrySchema,
  type RaZPromptsEntry,
} from "@/shared/lib/schemas/raz-prompts/entry.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";
import { createServerClient } from "@/shared/lib/supabase/server";

type CreatePromptInput = Pick<
  RaZPromptsEntry,
  "title" | "versions" | "tags" | "keywords"
>;

export async function createPromptEntryAction(
  input: CreatePromptInput
): Promise<ActionResult<{ promptId: string }>> {
  const traceId = logger.startTrace("createPromptEntry_v4.0");
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.warn(
        "[createPromptEntry] Intento de crear prompt sin autenticación."
      );
      return { success: false, error: "auth_required" };
    }

    const now = new Date().toISOString();
    const newPromptId = createId();

    // --- MEJORA ARQUITECTÓNICA v4.0 ---
    // El documento se crea limpio, sin conocimiento de los activos BAVI.
    // El campo `baviAssetIds` es opcional y no se inicializa aquí.
    const promptDocument: RaZPromptsEntry = {
      ...input,
      aiService: input.tags.ai,
      promptId: newPromptId,
      userId: user.id,
      status: "pending_generation", // Estado inicial
      createdAt: now,
      updatedAt: now,
    };
    // --- FIN DE MEJORA ---

    const validation = RaZPromptsEntrySchema.safeParse(promptDocument);
    if (!validation.success) {
      logger.error("[createPromptEntry] Fallo de validación de Zod.", {
        error: validation.error.flatten(),
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
    });
    logger.endTrace(traceId);
    return { success: false, error: "No se pudo crear la entrada del prompt." };
  }
}
