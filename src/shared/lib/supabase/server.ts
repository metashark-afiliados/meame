// RUTA: src/shared/lib/supabase/server.ts
/**
 * @file server.ts
 * @description SSoT para la creación del cliente de Supabase en el servidor.
 *              v4.1.0 (Elite Code Hygiene): Se alinea el manejo de errores
 *              con las convenciones de código del proyecto para resolver las
 *              advertencias del linter sobre variables no utilizadas.
 * @version 4.1.0
 * @author L.I.A. Legacy
 */
import {
  createServerClient as supabaseCreateServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { cookies } from "next/headers";
import { logger } from "@/shared/lib/logging";

export function createServerClient() {
  logger.trace(
    "[Supabase Client] Creando nueva instancia del cliente para el servidor (v4.1 - Elite Hygiene)..."
  );
  const cookieStore = cookies();

  return supabaseCreateServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (_error) {
            // --- [INICIO DE REFACTORIZACIÓN DE HIGIENE] ---
            // La variable se prefija con '_' para indicar que su uso es intencionadamente omitido.
            // Esto es esperado en contextos de solo lectura como Server Components.
            // --- [FIN DE REFACTORIZACIÓN DE HIGIENE] ---
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (_error) {
            // --- [INICIO DE REFACTORIZACIÓN DE HIGIENE] ---
            // La variable se prefija con '_' para indicar que su uso es intencionadamente omitido.
            // --- [FIN DE REFACTORIZACIÓN DE HIGIENE] ---
          }
        },
      },
    }
  );
}
