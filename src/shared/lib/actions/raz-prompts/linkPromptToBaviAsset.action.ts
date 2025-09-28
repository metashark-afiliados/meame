// RUTA: src/shared/lib/actions/raz-prompts/linkPromptToBaviAsset.action.ts
/**
 * @file linkPromptToBaviAsset.action.ts
 * @description Server Action simbiótica para vincular un activo de BAVI a un genoma de prompt en Supabase.
 * @version 7.0.0 (Migración a Supabase y Lógica de Array)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { createServerClient } from "@/shared/lib/supabase/server";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";
import { z } from "zod"; // Importar z para validación

interface LinkPromptInput {
  promptId: string;
  baviAssetId: string;
  baviVariantId: string; // Aunque se usará el array, este id puede ser el 'primario'
  imageUrl?: string; // Para futuras referencias directas o meta
  workspaceId: string;
}

export async function linkPromptToBaviAssetAction({
  promptId,
  baviAssetId,
  baviVariantId,
  imageUrl,
  workspaceId,
}: LinkPromptInput): Promise<ActionResult<{ updatedCount: number }>> {
  const traceId = logger.startTrace("linkPromptToBaviAsset_v7.0_Supabase");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logger.warn(
      "[Action] Intento no autorizado de vincular prompt a activo BAVI.",
      { traceId }
    );
    return { success: false, error: "auth_required" };
  }

  logger.info(
    `[Action] Vinculando prompt ${promptId} a activo BAVI ${baviAssetId} para usuario: ${user.id} en workspace: ${workspaceId}`,
    { traceId }
  );

  try {
    // --- GUARDIA DE SEGURIDAD DE WORKSPACE ---
    const { data: memberCheck, error: memberError } = await supabase.rpc(
      "is_workspace_member",
      { workspace_id_to_check: workspaceId, min_role: "member" }
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

    if (!promptId || !baviAssetId || !baviVariantId) {
      logger.warn("[Action] Faltan IDs esenciales para la vinculación.", {
        promptId,
        baviAssetId,
        baviVariantId,
        traceId,
      });
      return { success: false, error: "Faltan IDs para la vinculación." };
    }

    // --- Lógica para manejar el array text[] bavi_asset_ids ---
    // 1. Obtener los bavi_asset_ids actuales del prompt para evitar sobrescribir
    const { data: currentPrompt, error: fetchError } = await supabase
      .from("razprompts_entries")
      .select("bavi_asset_ids")
      .eq("id", promptId)
      .eq("user_id", user.id) // Asegurar que el usuario es el propietario
      .eq("workspace_id", workspaceId) // Asegurar que está en el workspace correcto
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        // No rows found
        logger.warn(
          `[Action] Prompt ${promptId} no encontrado o acceso denegado.`,
          { traceId, error: fetchError.message }
        );
        throw new Error(
          `No se encontró un prompt con ID: ${promptId} o no tienes permiso.`
        );
      }
      logger.error(`[Action] Error al obtener el prompt ${promptId}.`, {
        error: fetchError.message,
        traceId,
      });
      throw new Error(`Error al buscar el prompt: ${fetchError.message}`);
    }

    let updatedBaviAssetIds = currentPrompt.bavi_asset_ids || [];
    // Añadir el nuevo baviAssetId solo si no está ya en el array
    if (!updatedBaviAssetIds.includes(baviAssetId)) {
      updatedBaviAssetIds = [...updatedBaviAssetIds, baviAssetId];
      logger.traceEvent(traceId, `Añadiendo ${baviAssetId} a bavi_asset_ids.`);
    } else {
      logger.traceEvent(traceId, `${baviAssetId} ya está en bavi_asset_ids.`);
    }

    // --- Actualizar el prompt en Supabase ---
    const updatePayload: Record<string, any> = {
      status: "generated", // Marcar como generado una vez vinculado
      updated_at: new Date().toISOString(),
      bavi_asset_ids: updatedBaviAssetIds, // Actualizar el array completo
      // Si el schema de la tabla Supabase tuviera una columna para un activo primario singular:
      // primary_bavi_asset_id: baviAssetId,
      // primary_bavi_variant_id: baviVariantId,
      // image_url: imageUrl // Si decides almacenar la URL directamente aquí
    };

    const { data, error: updateError } = await supabase
      .from("razprompts_entries")
      .update(updatePayload)
      .eq("id", promptId)
      .eq("user_id", user.id) // Doble verificación de propiedad antes de actualizar
      .eq("workspace_id", workspaceId)
      .select("id") // Seleccionar el ID para confirmar la actualización
      .single();

    if (updateError) {
      logger.error(`[Action] Error al actualizar el prompt ${promptId}.`, {
        error: updateError.message,
        traceId,
      });
      throw new Error(`Error al actualizar el prompt: ${updateError.message}`);
    }

    if (!data) {
      // Si data es null, significa que no se encontró el registro para actualizar (a pesar del fetch previo)
      logger.warn(
        `[Action] Prompt ${promptId} no fue actualizado (no se encontró el registro final para el update).`,
        { traceId }
      );
      return {
        success: false,
        error:
          "El prompt no pudo ser actualizado o no se encontró el registro.",
      };
    }

    logger.success(
      `[Action] Prompt ${promptId} vinculado con éxito al activo ${baviAssetId} en Supabase.`,
      { traceId, supabaseId: data.id }
    );
    return { success: true, data: { updatedCount: 1 } }; // Asumimos 1 si select().single() es exitoso
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[Action] Fallo crítico en la acción de vinculación.", {
      error: errorMessage,
      traceId,
    });
    return {
      success: false,
      error: `No se pudo vincular el prompt al activo: ${errorMessage}`,
    };
  } finally {
    logger.endTrace(traceId);
  }
}
