// RUTA: src/shared/lib/middleware/handlers/auth.handler.ts
/**
 * @file auth.handler.ts
 * @description Manejador de autenticación para el middleware, ahora con una única
 *              fuente de verdad para la detección de rutas protegidas y una higiene
 *              de código de élite.
 * @version 8.1.0 (Elite Code Hygiene)
 *@author RaZ Podestá - MetaShark Tech
 */
"use server";

import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type MiddlewareHandler } from "../engine";
import { logger } from "../../logging";
import { routes, RouteType } from "../../navigation";
import { getCurrentLocaleFromPathname } from "../../utils/i18n/i18n.utils";

/**
 * @function isProtectedRoute
 * @description Determina si una ruta es protegida consumiendo la SSoT `navigation.ts`.
 * @param {string} pathname - La ruta de la petición actual.
 * @param {string} locale - El locale extraído de la ruta.
 * @returns {boolean} - Verdadero si la ruta coincide con una definición marcada como `DevOnly`.
 */
function isProtectedRoute(pathname: string, locale: string): boolean {
  for (const routeKey in routes) {
    const route = routes[routeKey as keyof typeof routes];
    const regexPath = route.template
      .replace(/\[\[\.\.\..*?\]\]/g, "(?:/.*)?")
      .replace(/\[\.\.\..*?\]/g, "/.*")
      .replace(/\[.*?\]/g, "[^/]+");

    const routeRegex = new RegExp(`^/${locale}${regexPath}/?$`);

    if (routeRegex.test(pathname)) {
      return route.type === RouteType.DevOnly;
    }
  }
  return false;
}

export const authHandler: MiddlewareHandler = async (req, res) => {
  const traceId = logger.startTrace("authHandler_v8.1");
  const { pathname } = req.nextUrl;
  const ip = req.headers.get("x-visitor-ip") || "IP desconocida";
  const locale = getCurrentLocaleFromPathname(pathname);

  try {
    if (!isProtectedRoute(pathname, locale)) {
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
        { path: pathname, ip, redirectTo: loginUrl.pathname, traceId }
      );
      return NextResponse.redirect(loginUrl);
    }

    logger.success(
      `[AuthHandler] Acceso autorizado para ${user.email} a ${pathname}.`,
      { traceId }
    );

    return res;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "[AuthHandler] Error inesperado durante la verificación de autorización.",
      { error: errorMessage, pathname, traceId }
    );
    return res;
  } finally {
    logger.endTrace(traceId);
  }
};
