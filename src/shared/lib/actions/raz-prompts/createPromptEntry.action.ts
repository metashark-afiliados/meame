// app/[locale]/(dev)/raz-prompts/_actions/createPromptEntry.action.ts
/**
 * @file createPromptEntry.action.ts
 * @description Server Action para crear una nueva entrada de prompt en la base de datos, con autenticación de usuario.
 * @version 3.0.0 (Supabase User Integration)
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
import { createServerClient } from "@/shared/lib/supabase/server"; // Importar cliente de Supabase

type CreatePromptInput = Pick<
  RaZPromptsEntry,
  "title" | "versions" | "tags" | "keywords"
>;

export async function createPromptEntryAction(
  input: CreatePromptInput
): Promise<ActionResult<{ promptId: string }>> {
  const traceId = logger.startTrace("createPromptEntry");
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
    const userId = user.id; // Usar el ID de usuario real de Supabase

    const promptDocument: RaZPromptsEntry = {
      ...input,
      aiService: input.tags.ai,
      promptId: newPromptId,
      userId,
      status: "pending_generation",
      createdAt: now,
      updatedAt: now,
      baviAssetId: undefined,
      baviVariantId: undefined,
      imageUrl: undefined, // Asegurarse de que esté indefinido inicialmente
    };

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

    const result = await collection.insertOne(validation.data);

    if (!result.acknowledged) {
      throw new Error("La inserción en la base de datos no fue confirmada.");
    }

    logger.success(
      `[createPromptEntry] Nuevo prompt creado con ID: ${newPromptId} por usuario: ${userId}`
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
