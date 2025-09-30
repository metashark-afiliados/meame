// RUTA: src/shared/lib/supabase/script-client.ts
/**
 * @file script-client.ts
 * @description SSoT para la creación de un cliente de Supabase aislado y
 *              seguro, para uso EXCLUSIVO en scripts del lado del servidor (Node.js).
 * @version 2.0.0 (Sovereign & Resilient)
 * @author L.I.A. Legacy
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/shared/lib/logging";

// Guardia de configuración a nivel de módulo para fallar rápido.
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  const errorMsg =
    "CRÍTICO: Las variables de entorno de Supabase para el cliente de script no están definidas.";
  logger.error(errorMsg);
  throw new Error(errorMsg);
}

/**
 * @function createScriptClient
 * @description Crea y devuelve una instancia del cliente de Supabase autenticada
 *              con la clave de rol de servicio para operaciones de backend.
 * @returns Una instancia del cliente de Supabase.
 */
export function createScriptClient() {
  logger.trace("[Supabase] Creando instancia de cliente para SCRIPT (v2.0)...");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
