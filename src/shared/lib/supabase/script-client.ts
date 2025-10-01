// RUTA: src/shared/lib/supabase/script-client.ts
/**
 * @file script-client.ts
 * @description SSoT para la creación de un cliente de Supabase aislado y
 *              seguro, para uso EXCLUSIVO en scripts del lado del servidor (Node.js).
 *              v4.0.0 (Architectural Isolation): Esta versión es arquitectónicamente
 *              pura. No tiene NINGUNA dependencia que apunte al directorio `src`,
 *              creando una barrera infranqueable entre el entorno de scripts y
 *              el entorno de la aplicación Next.js para prevenir errores de boundary.
 * @version 4.0.0
 *@author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import chalk from "chalk";

// Guardia de configuración a nivel de módulo para fallar rápido.
try {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error(
      "Las variables de entorno de Supabase (URL y SERVICE_ROLE_KEY) no están definidas."
    );
  }
} catch (error) {
  const errorMessage =
    error instanceof Error ? error.message : "Error desconocido.";
  console.error(
    chalk.red.bold(
      `[Supabase Script Client] CRÍTICO: Fallo de configuración inicial. ${errorMessage}`
    )
  );
  throw error;
}

/**
 * @function createScriptClient
 * @description Crea y devuelve una instancia del cliente de Supabase autenticada
 *              con la clave de rol de servicio para operaciones de backend.
 * @returns Una instancia del cliente de Supabase.
 */
export function createScriptClient() {
  // Se utiliza console.log directamente para evitar importar el logger de la aplicación.
  console.log(
    chalk.gray("[Supabase] Creando instancia de cliente para SCRIPT (v4.0)...")
  );
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
