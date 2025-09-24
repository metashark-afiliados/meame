// RUTA: shared/lib/supabase/middleware.ts
/**
 * @file middleware.ts
 * @description SSoT para la lógica de middleware de gestión de sesión de Supabase.
 *              v2.3.0 (Environment-Aware Dev Routes): La protección de rutas
 *              del DCC ahora solo se activa en producción, permitiendo un
 *              flujo de trabajo sin fricciones en desarrollo.
 * @version 2.3.0
 * @author nextjs-with-supabase (original), RaZ Podestá - MetaShark Tech (naturalización)
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/shared/lib/logging";

export async function updateSession(
  request: NextRequest
): Promise<NextResponse> {
  const supabaseResponse = NextResponse.next({
    request,
  });

  logger.trace("[Supabase Middleware] Actualizando sesión...");

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isDevRoute = pathname.includes("/dev");
  const isLoginPage = pathname.includes("/dev/login");

  // --- [INICIO DE MEJORA DE LÓGICA DE ÉLITE] ---
  // La protección de rutas de desarrollo ahora solo se aplica en producción.
  if (
    process.env.NODE_ENV === "production" &&
    isDevRoute &&
    !isLoginPage &&
    !user
  ) {
    const locale = pathname.split("/")[1] || "it-IT";
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dev/login`;
    logger.warn(
      `[Supabase Middleware] Acceso denegado a ruta protegida en PRODUCCIÓN. Redirigiendo a login.`,
      { path: pathname }
    );
    return NextResponse.redirect(url);
  }
  // --- [FIN DE MEJORA DE LÓGICA DE ÉLITE] ---

  return supabaseResponse;
}
