// RUTA: scripts/supabase/script-client.ts
/**
 * @file script-client.ts
 * @description SSoT para la creación de un cliente de Supabase aislado, soberano y
 *              arquitectónicamente puro para uso EXCLUSIVO en scripts de Node.js.
 *              v2.0.0 (Architectural Purity): Se eliminan TODAS las dependencias
 *              hacia el directorio `src/`, resolviendo errores de module boundary.
 * @version 2.0.0
 * @author L.I.A. Legacy
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import chalk from "chalk";

// Guardia de configuración a nivel de módulo para fallar rápido.
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  const errorMsg =
    "CRÍTICO: Las variables de entorno de Supabase (URL y SERVICE_ROLE_KEY) no están definidas.";
  console.error(chalk.red.bold(`[Supabase Script Client] ${errorMsg}`));
  throw new Error(errorMsg);
}

/**
 * @function createScriptClient
 * @description Crea y devuelve una instancia del cliente de Supabase autenticada
 *              con la clave de rol de servicio para operaciones de backend.
 * @returns Una instancia del cliente de Supabase.
 */
export function createScriptClient() {
  console.log(
    chalk.gray(
      "[Supabase] Creando instancia de cliente para SCRIPT (v2.0 - Aislado)..."
    )
  );
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
