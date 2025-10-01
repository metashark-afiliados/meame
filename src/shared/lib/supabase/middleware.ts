// RUTA: src/shared/lib/supabase/middleware.ts
/**
 * @file middleware.ts
 * @description SSoT para la lógica de middleware de gestión de sesión de Supabase.
 *              Forjado con observabilidad de élite y resiliencia.
 * @version 6.0.0 (Holistic Elite Leveling)
 *@author RaZ Podestá - MetaShark Tech
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/shared/lib/logging";

export async function updateSession(
  request: NextRequest
): Promise<NextResponse> {
  const traceId = logger.startTrace("supabase.updateSession_v6.0");
  logger.startGroup("[Supabase Middleware] Actualizando sesión...");

  // La respuesta se crea aquí y se muta dentro del manejador de cookies de Supabase.
  // Usar 'const' es correcto porque la referencia al objeto no cambia.
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: "", ...options });
            response.cookies.set({ name, value: "", ...options });
          },
        },
      }
    );
    logger.traceEvent(traceId, "Cliente de Supabase para middleware creado.");

    // Esta llamada es crucial, refresca el token de autenticación si es necesario.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      logger.traceEvent(
        traceId,
        `Sesión de usuario [${user.id}] refrescada (si fue necesario).`
      );
    } else {
      logger.traceEvent(traceId, "No hay sesión de usuario activa.");
    }

    logger.success(
      "[Supabase Middleware] Actualización de sesión completada con éxito.",
      { traceId }
    );
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "[Supabase Middleware] Fallo crítico al intentar actualizar la sesión. Se devolverá la respuesta original para no interrumpir el flujo.",
      { error: errorMessage, traceId }
    );
    // Devolvemos la respuesta original para no romper la navegación en caso de error.
    return response;
  } finally {
    logger.endGroup();
    // Se añade contexto al final de la traza para una depuración más rápida.
    const finalContext = response.ok
      ? { status: "Success" }
      : { status: "Failed" };
    logger.endTrace(traceId, finalContext);
  }
}
