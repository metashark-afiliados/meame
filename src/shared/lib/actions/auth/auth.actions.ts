// RUTA: src/shared/lib/actions/auth/auth.actions.ts
/**
 * @file auth.actions.ts
 * @description SSoT para las Server Actions de autenticación. Incluye registro,
 *              inicio de sesión, recuperación de contraseña, auditoría de sesión y
 *              la inyección de la cookie de modo desarrollador.
 * @version 7.0.0 (Holistic Refactoring & Elite Observability)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { headers, cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { logger } from "@/shared/lib/logging";
import { createServerClient } from "@/shared/lib/supabase/server";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import {
  LoginSchema,
  type LoginFormData,
} from "@/shared/lib/schemas/auth/login.schema";
import {
  SignUpSchema,
  type SignUpFormData,
} from "@/shared/lib/schemas/auth/signup.schema";
import {
  ForgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/shared/lib/schemas/auth/forgot-password.schema";

export async function loginWithPasswordAction(
  data: LoginFormData
): Promise<ActionResult<{ success: true }>> {
  const traceId = logger.startTrace("loginWithPasswordAction_v7.0");
  logger.info("[AuthAction] Iniciando proceso de login con contraseña...");

  const validation = LoginSchema.safeParse(data);
  if (!validation.success) {
    logger.warn("[AuthAction] Fallo de validación de datos de entrada.", {
      errors: validation.error.flatten(),
      traceId,
    });
    logger.endTrace(traceId);
    return { success: false, error: "Datos de login inválidos." };
  }

  const { email, password } = validation.data;
  const supabase = createServerClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !authData.user) {
    logger.error("[AuthAction] Error de autenticación desde Supabase.", {
      error: error?.message,
      traceId,
    });
    logger.endTrace(traceId);
    return { success: false, error: "Credenciales inválidas." };
  }

  logger.traceEvent(traceId, "Login exitoso en Supabase Auth.", {
    userId: authData.user.id,
  });

  // Lógica de inyección de cookie para modo desarrollador
  const superuserEmail = process.env.SUPERUSER_EMAIL;
  if (superuserEmail && email === superuserEmail) {
    logger.success(
      "[AuthAction] ¡Superusuario detectado! Activando modo desarrollador."
    );
    cookies().set("dev_mode_token", `activated_${Date.now()}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 31536000, // 1 año
      path: "/",
      sameSite: "strict",
    });
    logger.traceEvent(traceId, "Cookie de modo desarrollador establecida.");
  }

  // Lógica de actualización de Última Sesión
  const headersList = headers();
  const ip = headersList.get("x-visitor-ip") || "Desconocida";
  const city = headersList.get("x-visitor-city") || "Desconocida";
  const country = headersList.get("x-visitor-country") || "Desconocido";
  const location =
    city !== "Desconocida" && country !== "Desconocido"
      ? `${city}, ${country}`
      : "Ubicación desconocida";

  const { error: rpcError } = await supabase.rpc("update_user_last_sign_in", {
    user_id_input: authData.user.id,
    ip_address_input: ip,
    location_input: location,
  });

  if (rpcError) {
    logger.error(
      "[AuthAction] Fallo al actualizar los datos de última sesión.",
      { userId: authData.user.id, error: rpcError.message, traceId }
    );
  } else {
    logger.traceEvent(traceId, "Datos de última sesión actualizados en DB.");
  }

  revalidatePath("/", "layout");
  logger.success(
    `[AuthAction] Login y actualización de sesión completados para: ${email}`
  );
  logger.endTrace(traceId);
  return { success: true, data: { success: true } };
}

export async function signUpAction(
  data: SignUpFormData
): Promise<ActionResult<{ success: true }>> {
  const traceId = logger.startTrace("signUpAction");
  logger.info("[AuthAction] Iniciando proceso de registro de élite...");

  const validation = SignUpSchema.safeParse(data);
  if (!validation.success) {
    const error = validation.error.flatten().fieldErrors;
    const errorMessage =
      Object.values(error).flat()[0] || "Datos de registro inválidos.";
    logger.warn("[AuthAction] Fallo de validación en registro.", {
      errors: error,
      traceId,
    });
    logger.endTrace(traceId);
    return { success: false, error: errorMessage };
  }

  const { email, password, fullName } = validation.data;
  const supabase = createServerClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName, // Añadimos metadatos que se usarán en el trigger
      },
    },
  });

  if (authError) {
    logger.error("[AuthAction] Error de registro desde Supabase Auth.", {
      error: authError.message,
      traceId,
    });
    logger.endTrace(traceId);
    return { success: false, error: authError.message };
  }

  if (!authData.user) {
    const errorMsg = "El registro no devolvió un objeto de usuario.";
    logger.error(`[AuthAction] ${errorMsg}`, { traceId });
    logger.endTrace(traceId);
    return { success: false, error: errorMsg };
  }

  // La creación del perfil ahora es manejada por un DB Trigger en Supabase.
  logger.success(
    `[AuthAction] Registro exitoso para: ${email}. Se requiere confirmación de email.`
  );
  logger.endTrace(traceId);
  return { success: true, data: { success: true } };
}

export async function sendPasswordResetAction(
  data: ForgotPasswordFormData
): Promise<ActionResult<{ success: true }>> {
  const traceId = logger.startTrace("sendPasswordResetAction");
  logger.info("[AuthAction] Iniciando proceso de reseteo de contraseña...");
  const supabase = createServerClient();

  const validation = ForgotPasswordSchema.safeParse(data);
  if (!validation.success) {
    logger.warn("[AuthAction] Email para reseteo inválido.", {
      error: validation.error.flatten(),
      traceId,
    });
    logger.endTrace(traceId);
    return { success: false, error: "La dirección de email es inválida." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(
    validation.data.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/account`,
    }
  );

  if (error) {
    logger.error("[AuthAction] Error al enviar el email de reseteo.", {
      error: error.message,
      traceId,
    });
    logger.endTrace(traceId);
    return {
      success: false,
      error: "No se pudo enviar el enlace de recuperación.",
    };
  }

  logger.success(
    `[AuthAction] Email de reseteo de contraseña enviado a: ${validation.data.email}`
  );
  logger.endTrace(traceId);
  return { success: true, data: { success: true } };
}
