// RUTA: src/shared/lib/actions/theme-fragments/createThemeFragment.action.ts
/**
 * @file createThemeFragment.action.ts
 * @description Server Action para crear un nuevo fragmento de tema en un workspace.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { createServerClient } from "@/shared/lib/supabase/server";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import type { ThemeFragment } from "./getThemeFragments.action";

interface CreateFragmentInput {
  workspaceId: string;
  name: string;
  type: "color" | "font" | "geometry";
  data: any;
}

export async function createThemeFragmentAction(
  input: CreateFragmentInput
): Promise<ActionResult<{ newFragment: ThemeFragment }>> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "auth_required" };

  // Valida la membresía en el workspace
  const { data: memberCheck, error: memberError } = await supabase.rpc(
    "is_workspace_member",
    { workspace_id_to_check: input.workspaceId }
  );
  if (memberError || !memberCheck) {
    return { success: false, error: "Acceso denegado al workspace." };
  }

  try {
    const { data: newFragment, error } = await supabase
      .from("theme_fragments")
      .insert({
        workspace_id: input.workspaceId,
        user_id: user.id,
        name: input.name,
        type: input.type,
        data: input.data,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: { newFragment } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("Fallo al crear el fragmento de tema", {
      error: errorMessage,
    });
    return { success: false, error: "No se pudo guardar el nuevo estilo." };
  }
}
