// RUTA: src/shared/lib/supabase/server.ts
/**
 * @file server.ts
 * @description SSoT para la creación del cliente de Supabase en el servidor.
 *              v4.0.0 (Production-Grade Security): Corregido para usar la
 *              SUPABASE_SERVICE_ROLE_KEY, otorgando al backend los privilegios
 *              de administrador necesarios para operaciones seguras.
 * @version 4.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import {
  createServerClient as supabaseCreateServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { cookies } from "next/headers";
import { logger } from "@/shared/lib/logging";

export function createServerClient() {
  logger.trace(
    "[Supabase Client] Creando nueva instancia del cliente para el servidor (v4.0 - Service Role)..."
  );
  const cookieStore = cookies();

  return supabaseCreateServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // --- [INICIO DE CORRECCIÓN DE SEGURIDAD CRÍTICA] ---
    // El cliente de servidor DEBE usar la clave de servicio para operaciones de administrador.
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    // --- [FIN DE CORRECCIÓN DE SEGURIDAD CRÍTICA] ---
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Este error es esperado en contextos de solo lectura como Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Este error es esperado en contextos de solo lectura
          }
        },
      },
    }
  );
}
