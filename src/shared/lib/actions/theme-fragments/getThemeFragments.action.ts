// RUTA: src/shared/lib/actions/theme-fragments/getThemeFragments.action.ts
/**
 * @file getThemeFragments.action.ts
 * @description Server Action para obtener los fragmentos de tema.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { createServerClient } from "@/shared/lib/supabase/server";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";

// Futuro: Crear un schema Zod para ThemeFragment y usar z.infer
export interface ThemeFragment {
  id: string;
  workspace_id: string | null;
  name: string;
  type: 'color' | 'font' | 'geometry';
  data: any;
}

export async function getThemeFragmentsAction(
  workspaceId: string,
  type: 'color' | 'font' | 'geometry'
): Promise<ActionResult<{ global: ThemeFragment[]; workspace: ThemeFragment[] }>> {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "auth_required" };

    try {
        const { data, error } = await supabase
            .from('theme_fragments')
            .select('*')
            .eq('type', type)
            .or(`workspace_id.eq.${workspaceId},workspace_id.is.null`);

        if (error) throw error;

        const globalFragments = data.filter(f => f.workspace_id === null);
        const workspaceFragments = data.filter(f => f.workspace_id === workspaceId);

        return { success: true, data: { global: globalFragments, workspace: workspaceFragments } };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido.";
        logger.error(`Fallo al obtener fragmentos de tema de tipo ${type}`, { error: errorMessage });
        return { success: false, error: "No se pudieron cargar los estilos." };
    }
}
