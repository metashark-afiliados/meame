// RUTA: src/shared/lib/supabase/script-client.ts
/**
 * @file script-client.ts
 * @description SSoT para la creación de un cliente de Supabase de "servicio"
 *              para ser usado EXCLUSIVAMENTE en scripts del lado del servidor.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/shared/lib/logging";

// Guardia de configuración a nivel de módulo
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  throw new Error(
    "Las variables de entorno de Supabase para el cliente de script no están definidas."
  );
}

/**
 * @function createScriptClient
 * @description Crea un cliente de Supabase con privilegios de administrador
 *              para operaciones de backend que no están en un contexto de petición.
 */
export function createScriptClient() {
  logger.trace("[Supabase] Creando instancia de cliente para SCRIPT...");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
