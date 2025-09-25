// RUTA: src/shared/lib/supabase/middleware.ts
/**
 * @file middleware.ts
 * @description SSoT para la lógica de middleware de gestión de sesión de Supabase.
 * @version 3.1.0 (Route SSoT Sync): Se alinea la lógica de redirección con la
 *              SSoT de rutas generada por el script, resolviendo un error crítico
 *              de tipo TS2339 y restaurando la integridad del guardián de seguridad.
 * @version 3.1.0
 * @author nextjs-with-supabase (original), RaZ Podestá - MetaShark Tech (naturalización)
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/shared/lib/logging";
import { routes } from "@/shared/lib/navigation";
import { getCurrentLocaleFromPathname } from "@/shared/lib/utils/i18n/i18n.utils";

export async function updateSession(
  request: NextRequest
): Promise<NextResponse> {
  const supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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
          supabaseResponse.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          supabaseResponse.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isDevRoute = pathname.includes("/dev");
  const isLoginPage = pathname.includes("/login");

  if (isDevRoute && !isLoginPage && !user) {
    const locale = getCurrentLocaleFromPathname(pathname);
    // --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
    // Se utiliza la clave de ruta 'login', que es la correcta generada por la SSoT.
    const url = request.nextUrl.clone();
    url.pathname = routes.login.path({ locale });
    // --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---

    logger.warn(
      `[Supabase Middleware] Acceso denegado a ruta protegida. Redirigiendo a login.`,
      { path: pathname }
    );
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
