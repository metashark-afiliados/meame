// RUTA: src/shared/lib/actions/account/get-current-user-profile.action.ts
/**
 * @file get-current-user-profile.action.ts
 * @description Server Action soberana para obtener los datos del perfil del
 *              usuario actualmente autenticado desde la tabla `public.profiles`.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { createServerClient } from "@/shared/lib/supabase/server";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";

// Definimos un tipo para el payload de datos del perfil que nos interesa.
export type UserProfileData = {
  full_name: string | null;
  last_sign_in_at: string | null;
  last_sign_in_ip: string | null;
  last_sign_in_location: string | null;
};

export async function getCurrentUserProfile_Action(): Promise<
  ActionResult<UserProfileData | null>
> {
  const traceId = logger.startTrace("getCurrentUserProfile_Action");
  logger.info("[Profile Action] Solicitando perfil del usuario actual...");

  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.warn("[Profile Action] No hay usuario autenticado.");
      logger.endTrace(traceId);
      // No es un error, simplemente no hay sesión.
      return { success: true, data: null };
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "full_name, last_sign_in_at, last_sign_in_ip, last_sign_in_location"
      )
      .eq("user_id", user.id)
      .single(); // .single() asegura que obtenemos un objeto o null, no un array.

    if (error) {
      logger.error(
        "[Profile Action] Error al consultar la tabla de perfiles.",
        {
          userId: user.id,
          error: error.message,
        }
      );
      throw new Error(error.message);
    }

    logger.success("[Profile Action] Perfil de usuario obtenido con éxito.", {
      userId: user.id,
    });
    logger.endTrace(traceId);
    return { success: true, data: profile };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[Profile Action] Fallo crítico al obtener el perfil.", {
      error: errorMessage,
    });
    logger.endTrace(traceId);
    return {
      success: false,
      error: "No se pudo obtener la información del perfil.",
    };
  }
}
