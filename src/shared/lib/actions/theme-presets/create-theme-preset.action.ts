// RUTA: src/shared/lib/actions/theme-presets/create-theme-preset.action.ts
/**
 * @file create-theme-preset.action.ts
 * @description Server Action para crear un nuevo preset de tema.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";
import { createServerClient } from "@/shared/lib/supabase/server";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import type { ThemePreset } from "@/shared/lib/schemas/theme-preset.schema";
import type { ThemeConfig } from "@/shared/lib/types/campaigns/draft.types";

interface CreatePresetInput {
  workspaceId: string;
  name: string;
  description?: string;
  themeConfig: ThemeConfig;
}

export async function createThemePresetAction(
  input: CreatePresetInput
): Promise<ActionResult<{ newPreset: ThemePreset }>> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "auth_required" };

  try {
    const { data: newPreset, error } = await supabase
      .from("theme_presets")
      .insert({
        workspace_id: input.workspaceId,
        user_id: user.id,
        name: input.name,
        description: input.description,
        theme_config: input.themeConfig,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: { newPreset } };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error desconocido.";
    logger.error("Fallo al crear el preset de tema", { error: msg });
    return { success: false, error: "No se pudo guardar el preset." };
  }
}
