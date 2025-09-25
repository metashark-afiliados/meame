// RUTA: src/shared/lib/actions/auth/auth.actions.ts
/**
 * @file auth.actions.ts
 * @description SSoT para las Server Actions de autenticación. Incluye registro,
 *              inicio de sesión, recuperación de contraseña y auditoría de sesión.
 * @version 5.0.0 (Password Reset & Last Sign-In Logic)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { headers } from "next/headers";
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
  const traceId = logger.startTrace("loginWithPasswordAction");
  logger.info("[AuthAction] Iniciando proceso de login con contraseña...");

  const validation = LoginSchema.safeParse(data);
  if (!validation.success) {
    logger.warn("[AuthAction] Fallo de validación de datos de entrada.", {
      errors: validation.error.flatten(),
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
    });
    logger.endTrace(traceId);
    return { success: false, error: "Credenciales inválidas." };
  }

  logger.traceEvent(traceId, "Login exitoso en Supabase Auth.", {
    userId: authData.user.id,
  });

  // --- Lógica de actualización de Última Sesión ---
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
    // No bloqueamos el login por esto, pero lo registramos como un error crítico.
    logger.error(
      "[AuthAction] Fallo al actualizar los datos de última sesión.",
      { userId: authData.user.id, error: rpcError.message }
    );
  } else {
    logger.traceEvent(traceId, "Datos de última sesión actualizados en DB.");
  }
  // --- Fin Lógica de actualización de Última Sesión ---

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
    });
    logger.endTrace(traceId);
    return { success: false, error: errorMessage };
  }

  const { email, password, fullName } = validation.data;
  const supabase = createServerClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    logger.error("[AuthAction] Error de registro desde Supabase Auth.", {
      error: authError.message,
    });
    logger.endTrace(traceId);
    return { success: false, error: authError.message };
  }

  if (!authData.user) {
    const errorMsg = "El registro no devolvió un objeto de usuario.";
    logger.error(`[AuthAction] ${errorMsg}`);
    logger.endTrace(traceId);
    return { success: false, error: errorMsg };
  }

  logger.traceEvent(traceId, "Usuario creado en auth.users.", {
    userId: authData.user.id,
  });

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ user_id: authData.user.id, full_name: fullName });

  if (profileError) {
    logger.error(
      "[AuthAction] Error al crear el perfil del usuario en public.profiles.",
      { error: profileError.message }
    );
    logger.endTrace(traceId);
    return { success: false, error: "No se pudo crear el perfil de usuario." };
  }

  logger.success(
    `[AuthAction] Registro y perfil creados para: ${email}. Se requiere confirmación de email.`
  );
  logger.endTrace(traceId);
  return { success: true, data: { success: true } };
}

export async function sendPasswordResetAction(
  data: ForgotPasswordFormData
): Promise<ActionResult<{ success: true }>> {
  logger.info("[AuthAction] Iniciando proceso de reseteo de contraseña...");
  const supabase = createServerClient();

  const validation = ForgotPasswordSchema.safeParse(data);
  if (!validation.success) {
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
    });
    return {
      success: false,
      error: "No se pudo enviar el enlace de recuperación.",
    };
  }

  logger.success(
    `[AuthAction] Email de reseteo de contraseña enviado a: ${validation.data.email}`
  );
  return { success: true, data: { success: true } };
}
