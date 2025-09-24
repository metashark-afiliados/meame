// RUTA: src/shared/lib/supabase/server.ts
/**
 * @file server.ts
 * @description SSoT para la creación del cliente de Supabase en el lado del servidor.
 * @version 3.1.0 (Middleware Dependency Fix)
 * @author nextjs-with-supabase (original), RaZ Podestá - MetaShark Tech (naturalización)
 */
import {
  createServerClient as supabaseCreateServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { cookies } from "next/headers";
// --- [INICIO DE REFACTORIZACIÓN DE RUTA] ---
import { logger } from "@/shared/lib/logging";
// --- [FIN DE REFACTORIZACIÓN DE RUTA] ---

export function createServerClient() {
  logger.trace(
    "[Supabase Client] Creando nueva instancia del cliente para el servidor..."
  );
  const cookieStore = cookies();

  return supabaseCreateServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            logger.trace(
              "[Supabase Server Client] Error esperado al intentar SET cookie en un contexto de solo lectura (ej. Server Component). La operación se ignora de forma segura.",
              { error: (error as Error).message }
            );
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            logger.trace(
              "[Supabase Server Client] Error esperado al intentar REMOVE cookie en un contexto de solo lectura. La operación se ignora de forma segura.",
              { error: (error as Error).message }
            );
          }
        },
      },
    }
  );
}
