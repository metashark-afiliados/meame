// RUTA: src/shared/lib/middleware/handlers/auth.handler.ts
/**
 * @file auth.handler.ts
 * @version 3.0.0 (Production-Grade Logging)
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import { NextResponse } from "next/server";
import { createServerClient } from "../../supabase/server";
import { type MiddlewareHandler } from "../engine";
import { logger } from "../../logging";
import { routes } from "../../navigation";
import { getCurrentLocaleFromPathname } from "../../utils/i18n/i18n.utils";

const PROTECTED_PATHS = ["/creator", "/analytics", "/account", "/dev"];

export const authHandler: MiddlewareHandler = async (req, res) => {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;
  const ip = req.headers.get("x-visitor-ip") || "IP desconocida";

  // Excepción para la propia página de login
  if (pathname.includes("/login")) return res;

  const locale = getCurrentLocaleFromPathname(pathname);
  const isProtectedRoute = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(`/${locale}${path}`)
  );

  if (!user && isProtectedRoute) {
    const loginUrl = new URL(routes.login.path({ locale }), req.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);

    logger.warn(
      `[AuthHandler] ACCESO NO AUTORIZADO a ruta protegida.`,
      {
        path: pathname,
        ip: ip,
        redirectTo: loginUrl.pathname,
      }
    );

    return NextResponse.redirect(loginUrl);
  }

  if (user && isProtectedRoute) {
    logger.trace(`[AuthHandler] Acceso autorizado para ${user.email} a ${pathname}.`);
  }

  return res;
};
