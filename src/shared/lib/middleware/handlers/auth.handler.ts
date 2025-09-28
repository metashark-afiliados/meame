// RUTA: src/shared/lib/middleware/handlers/auth.handler.ts
/**
 * @file auth.handler.ts
 * @description Manejador de autenticación para el middleware.
 * @version 5.0.0 (Edge Runtime Compatibility Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type MiddlewareHandler } from "../engine";
import { logger } from "../../logging";
import { routes } from "../../navigation";
import { getCurrentLocaleFromPathname } from "../../utils/i18n/i18n.utils";

const PROTECTED_PATHS = ["/creator", "/analytics", "/account", "/dev"];

export const authHandler: MiddlewareHandler = async (req, res) => {
  const traceId = logger.startTrace("authHandler_v5.0");
  logger.trace("[AuthHandler] Iniciando...", {
    path: req.nextUrl.pathname,
    traceId,
  });

  // --- [INICIO DE REFACTORIZACIÓN CRÍTICA] ---
  // Se crea un cliente de Supabase específico para el contexto del middleware.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: "", ...options });
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );
  // --- [FIN DE REFACTORIZACIÓN CRÍTICA] ---

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = req.nextUrl;
  const ip = req.headers.get("x-visitor-ip") || "IP desconocida";

  if (pathname.includes("/login")) {
    logger.trace("[AuthHandler] Ruta de login, omitiendo.", { traceId });
    logger.endTrace(traceId);
    return res;
  }

  const locale = getCurrentLocaleFromPathname(pathname);
  const isProtectedRoute = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(`/${locale}${path}`)
  );

  if (!user && isProtectedRoute) {
    const loginUrl = new URL(routes.login.path({ locale }), req.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);

    logger.warn(`[AuthHandler] ACCESO NO AUTORIZADO a ruta protegida.`, {
      path: pathname,
      ip,
      redirectTo: loginUrl.pathname,
      traceId,
    });
    logger.endTrace(traceId);
    return NextResponse.redirect(loginUrl);
  }

  if (user) {
    logger.trace(
      `[AuthHandler] Acceso autorizado para ${user.email} a ${pathname}.`,
      { traceId }
    );
  }

  logger.endTrace(traceId);
  return res;
};
