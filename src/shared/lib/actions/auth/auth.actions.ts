// RUTA: src/shared/lib/actions/auth/auth.actions.ts
/**
 * @file auth.actions.ts
 * @description SSoT para las Server Actions de autenticación, ahora con
 *              "Identity Stitching" de producción.
 * @version 10.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { logger } from "@/shared/lib/logging";
import { createServerClient } from "@/shared/lib/supabase/server";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import {
  SignUpSchema,
  type SignUpFormData,
} from "@/shared/lib/schemas/auth/signup.schema";
// ... (otras importaciones como login, forgot password)

export async function signUpAction(
  data: SignUpFormData,
  fingerprintId?: string
): Promise<ActionResult<{ success: true }>> {
  const traceId = logger.startTrace("signUpAction_v10.0");
  logger.info(
    "[AuthAction] Iniciando flujo de registro de producción con Identity Stitching...",
    { hasFingerprint: !!fingerprintId, traceId }
  );

  const validation = SignUpSchema.safeParse(data);
  if (!validation.success) {
    // ... (manejo de error de validación)
    return { success: false, error: "Datos de registro inválidos." };
  }

  const { email, password, fullName } = validation.data;
  const supabase = createServerClient();

  // --- Lógica de Creación de Usuario, Perfil y Workspace ---
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

  if (authError || !authData.user) {
    logger.error("[AuthAction] Error al crear usuario en Supabase Auth.", {
      error: authError?.message,
      traceId,
    });
    return {
      success: false,
      error: authError?.message || "No se pudo crear el usuario.",
    };
  }
  const user = authData.user;
  logger.success(`[AuthAction] Usuario ${user.id} creado en auth.users.`, {
    traceId,
  });

  // ... (Creación de perfil y workspace personal, con sus respectivos manejos de errores)

  // --- LÓGICA DE IDENTITY STITCHING DE PRODUCCIÓN ---
  if (fingerprintId) {
    logger.info(
      `[AuthAction] Vinculando fingerprint ${fingerprintId} al nuevo usuario ${user.id}`,
      { traceId }
    );
    const { error: stitchError } = await supabase
      .from("visitor_fingerprints")
      .insert({
        fingerprint_id: fingerprintId,
        user_id: user.id,
      });

    if (stitchError) {
      // ESTO NO ES UN ERROR FATAL. El registro del usuario fue exitoso.
      // Se registra para análisis, pero no se devuelve error al cliente.
      logger.error(
        "[AuthAction] Fallo al vincular el fingerprint del visitante. El registro del usuario continúa.",
        {
          userId: user.id,
          fingerprintId,
          error: stitchError.message,
          traceId,
        }
      );
    } else {
      logger.success(
        `[AuthAction] Fingerprint ${fingerprintId} vinculado exitosamente.`,
        { traceId }
      );
    }
  }
  // --- FIN DE LÓGICA DE IDENTITY STITCHING ---

  revalidatePath("/", "layout");
  logger.success(
    `[AuthAction] Flujo de registro y vinculación completo para: ${email}`,
    { traceId }
  );
  logger.endTrace(traceId);
  return { success: true, data: { success: true } };
}

// ... (resto de las actions: loginWithPasswordAction, sendPasswordResetAction)
