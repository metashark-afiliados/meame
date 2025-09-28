// RUTA: src/shared/lib/actions/raz-prompts/createPromptEntry.action.ts
/**
 * @file createPromptEntry.action.ts
 * @description Server Action de producción para crear una nueva entrada de prompt en Supabase.
 * @version 7.0.0 (Migración a Supabase)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { createId } from "@paralleldrive/cuid2";
import { createServerClient } from "@/shared/lib/supabase/server";
import {
  RaZPromptsEntrySchema,
  type RaZPromptsEntry,
} from "@/shared/lib/schemas/raz-prompts/entry.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";
import { z } from "zod"; // Importar z para validación de tipo en los campos JSONB

type CreatePromptInput = Pick<
  RaZPromptsEntry,
  "title" | "versions" | "tags" | "keywords" | "aiService" // aiService ya está en RaZPromptsEntry, se incluye para claridad
> & { workspaceId: string };

export async function createPromptEntryAction(
  input: CreatePromptInput
): Promise<ActionResult<{ promptId: string }>> {
  const traceId = logger.startTrace("createPromptEntry_v7.0_Supabase");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logger.warn("[Action] Intento no autorizado de crear prompt.", { traceId });
    return { success: false, error: "auth_required" };
  }

  const { workspaceId } = input;
  logger.info(
    `[Action] Creando nuevo prompt para usuario: ${user.id} en workspace: ${workspaceId}`,
    { traceId }
  );

  try {
    // --- GUARDIA DE SEGURIDAD DE WORKSPACE ---
    // Verificar que el usuario es miembro del workspace antes de proceder
    const { data: memberCheck, error: memberError } = await supabase.rpc(
      "is_workspace_member",
      { workspace_id_to_check: workspaceId, min_role: "member" } // Se pasa 'member' explícitamente
    );
    if (memberError || !memberCheck) {
      logger.error("[Action] Verificación de membresía fallida.", {
        userId: user.id,
        workspaceId,
        error: memberError?.message || "Acceso denegado al workspace.",
        traceId,
      });
      throw new Error("Acceso denegado al workspace.");
    }
    logger.traceEvent(
      traceId,
      `Usuario ${user.id} verificado como miembro del workspace ${workspaceId}.`
    );
    // --- FIN DE LA GUARDIA DE SEGURIDAD ---

    // Generar un CUID2 para el `promptId` lógico que será el `id` de la fila en Supabase.
    const newPromptId = createId();

    // Validar los datos de entrada con Zod.
    // Aunque el esquema de Supabase tiene sus propias validaciones (NOT NULL, CHECK),
    // esta validación en la capa de aplicación proporciona mensajes de error más amigables
    // y seguridad de tipos en TypeScript.
    // La AI Service se toma de input.tags.ai como ya estaba definido en el schema Zod original.
    const fullPromptData: RaZPromptsEntry = {
      promptId: newPromptId,
      userId: user.id,
      workspaceId: workspaceId,
      title: input.title,
      status: "pending_generation", // Estado inicial
      aiService: input.aiService || input.tags.ai, // Usar input.aiService si existe, si no, del tags.ai
      keywords: input.keywords,
      versions: input.versions,
      tags: input.tags,
      baviAssetIds: [], // Inicialmente vacío
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validation = RaZPromptsEntrySchema.safeParse(fullPromptData);

    if (!validation.success) {
      logger.error(
        "[createPromptEntry] Fallo de validación de Zod antes de la inserción en Supabase.",
        {
          errors: validation.error.flatten(),
          traceId,
        }
      );
      return {
        success: false,
        error: "Los datos del prompt son inválidos según el esquema.",
      };
    }

    // Preparar el objeto para la inserción en Supabase.
    // Los campos `versions` y `tags` se almacenan directamente como JSONB.
    // `keywords` y `baviAssetIds` son `text[]`.
    const { data, error } = await supabase
      .from("razprompts_entries")
      .insert({
        id: validation.data.promptId, // Mapear promptId de Zod al id de la tabla Supabase
        user_id: validation.data.userId,
        workspace_id: validation.data.workspaceId,
        title: validation.data.title,
        status: validation.data.status,
        ai_service: validation.data.aiService,
        keywords: validation.data.keywords,
        versions: validation.data.versions, // JSONB
        tags: validation.data.tags, // JSONB
        bavi_asset_ids: validation.data.baviAssetIds, // text[]
        created_at: validation.data.createdAt,
        updated_at: validation.data.updatedAt,
      })
      .select("id") // Seleccionar el ID (UUID de Supabase) generado por la BD
      .single();

    if (error) {
      throw new Error(error.message);
    }

    logger.success(
      `[createPromptEntry] Nuevo genoma de prompt ${data.id} creado en workspace ${workspaceId} en Supabase.`,
      { traceId, supabaseId: data.id }
    );
    return { success: true, data: { promptId: data.id } }; // Devolver el ID real de Supabase
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "[createPromptEntry] Fallo crítico en la acción de Supabase.",
      {
        error: errorMessage,
        traceId,
      }
    );
    return {
      success: false,
      error: `No se pudo crear la entrada del prompt: ${errorMessage}`,
    };
  } finally {
    logger.endTrace(traceId);
  }
}
