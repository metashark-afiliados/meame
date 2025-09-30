// RUTA: src/shared/lib/middleware/handlers/auth.handler.ts
/**
 * @file auth.handler.ts
 * @description Manejador de autenticación para el middleware.
 * @version 7.0.0 (Resilient Pattern Matching)
 * @author L.I.A. Legacy
 */
import "server-only";
import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type MiddlewareHandler } from "../engine";
import { logger } from "../../logging";
import { routes } from "../../navigation";
import { getCurrentLocaleFromPathname } from "../../utils/i18n/i18n.utils";

const PROTECTED_ROUTE_KEYS: (keyof typeof routes)[] = [
  "creatorCampaignSuite",
  "analytics",
  "account",
  "devDashboard",
  "bavi",
  "razPrompts",
  "cogniReadDashboard",
  "nos3Dashboard",
];

export const authHandler: MiddlewareHandler = async (req, res) => {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get("x-visitor-ip") || "IP desconocida";
  const locale = getCurrentLocaleFromPathname(pathname);

  const isProtectedRoute = PROTECTED_ROUTE_KEYS.some((key) => {
    const routeTemplate = routes[key].template;
    // Convierte la plantilla de ruta en una expresión regular robusta.
    // Ejemplos:
    // /analytics/[variantId] -> /^\/it-IT\/analytics\/[^/]+\/?$/
    // /creator/[[...stepId]] -> /^\/it-IT\/creator(?:\/.*)?\/?$/
    const regexPath = routeTemplate
      .replace(/\[\[\.\.\..*?\]\]/g, "(?:/.*)?") // [[...slug]] (opcional)
      .replace(/\[\.\.\..*?\]/g, "/.*") // [...slug]
      .replace(/\[.*?\]/g, "[^/]+"); // [slug]

    const routeRegex = new RegExp(`^/${locale}${regexPath}/?$`);
    return routeRegex.test(pathname);
  });

  if (!isProtectedRoute) {
    logger.trace(
      `[AuthHandler] Decisión: Omitir. Razón: La ruta '${pathname}' no es protegida.`
    );
    return res;
  }

  logger.trace(
    `[AuthHandler] Ruta protegida detectada: '${pathname}'. Verificando sesión...`
  );

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          req.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: CookieOptions) => {
          req.cookies.set({ name, value: "", ...options });
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL(routes.login.path({ locale }), req.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
    logger.warn(
      `[AuthHandler] Decisión: Redirigir. Razón: ACCESO NO AUTORIZADO a ruta protegida.`,
      { path: pathname, ip, redirectTo: loginUrl.pathname }
    );
    return NextResponse.redirect(loginUrl);
  }

  logger.success(
    `[AuthHandler] Acceso autorizado para ${user.email} a ${pathname}.`
  );

  return res;
};
