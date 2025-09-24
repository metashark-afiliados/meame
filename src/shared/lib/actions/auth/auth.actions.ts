// RUTA: shared/lib/actions/auth.actions.ts
/**
 * @file auth.actions.ts
 * @description SSoT para las Server Actions relacionadas con la autenticación.
 * @version 2.0.0 (Unambiguous Client Import)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { revalidatePath } from "next/cache";
import { logger } from "@/shared/lib/logging";
import { createServerClient } from "@/shared/lib/supabase/server"; // <-- IMPORTACIÓN CORREGIDA
import type { ActionResult } from "@/shared/lib/types/actions.types";
import {
  LoginSchema,
  type LoginFormData,
} from "@/shared/lib/schemas/auth/login.schema";

export async function loginWithPasswordAction(
  data: LoginFormData
): Promise<ActionResult<{ success: true }>> {
  logger.info("[AuthAction] Iniciando proceso de login con contraseña...");

  const validation = LoginSchema.safeParse(data);
  if (!validation.success) {
    logger.warn("[AuthAction] Fallo de validación de datos de entrada.", {
      errors: validation.error.flatten(),
    });
    return { success: false, error: "Datos de login inválidos." };
  }

  const { email, password } = validation.data;
  const supabase = createServerClient(); // <-- USO CORREGIDO

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logger.error("[AuthAction] Error de autenticación desde Supabase.", {
      error: error.message,
    });
    return { success: false, error: "Credenciales inválidas." };
  }

  revalidatePath("/", "layout");

  logger.success(`[AuthAction] Login exitoso para el usuario: ${email}`);
  return { success: true, data: { success: true } };
}
