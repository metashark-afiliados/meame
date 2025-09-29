// RUTA: src/shared/lib/actions/auth/auth.actions.ts
/**
 * @file auth.actions.ts
 * @description SSoT para las Server Actions de autenticación.
 * @version 12.0.0 (Elite Error Handling & Identity Stitching)
 * @author L.I.A. Legacy - Asistente de Refactorización
 */
"use server";

import { revalidatePath } from "next/cache";
import { logger } from "@/shared/lib/logging";
import { createServerClient } from "@/shared/lib/supabase/server";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { SignUpSchema, type SignUpFormData } from "@/shared/lib/schemas/auth/signup.schema";

export async function signUpAction(
  data: SignUpFormData,
  fingerprintId?: string
): Promise<ActionResult<{ success: true }>> {
  const traceId = logger.startTrace("signUpAction_v12.0");
  logger.info("[AuthAction] Iniciando flujo de registro...", { hasFingerprint: !!fingerprintId, traceId });

  try {
    const validation = SignUpSchema.safeParse(data);
    if (!validation.success) {
      // Manejo de Error de Validación
      const firstError = validation.error.errors[0].message;
      logger.warn("[AuthAction] Validación de datos fallida.", { error: firstError, traceId });
      return { success: false, error: firstError };
    }

    const { email, password, fullName } = validation.data;
    const supabase = createServerClient();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { full_name: fullName },
    });

    if (authError || !authData.user) {
      // Manejo de Error de Creación de Usuario
      logger.error("[AuthAction] Error en Supabase Auth.", { error: authError?.message, traceId });
      throw new Error(authError?.message || "No se pudo crear el usuario.");
    }

    const user = authData.user;

    if (fingerprintId) {
      const { error: rpcError } = await supabase.rpc('migrate_anonymous_events_to_user', {
        p_fingerprint_id: fingerprintId, p_user_id: user.id
      });
      if (rpcError) {
        // Error no fatal, solo se registra.
        logger.error("[AuthAction] Fallo en la migración de eventos anónimos.", { userId: user.id, error: rpcError, traceId });
      }
    }

    revalidatePath("/", "layout");
    return { success: true, data: { success: true } };

  } catch (error) {
    // Manejo de Errores Genéricos / Inesperados
    const errorMessage = error instanceof Error ? error.message : "Error desconocido durante el registro.";
    logger.error("[AuthAction] Fallo crítico en el flujo de registro.", { error: errorMessage, traceId });
    return { success: false, error: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo." };
  } finally {
    logger.endTrace(traceId);
  }
}
