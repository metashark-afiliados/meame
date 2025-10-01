// RUTA: src/middleware.ts
/**
 * @file middleware.ts
 * @description Guardián de la puerta de entrada, ahora orquestado por el motor de pipeline soberano y restaurado.
 * @version 13.0.0 (Sovereign Pipeline & Architectural Integrity Restoration)
 *@author RaZ Podestá - MetaShark Tech
 */
import { type NextRequest, NextResponse } from "next/server";
import { logger } from "./shared/lib/logging";
import { createPipeline } from "./shared/lib/middleware/engine";
import {
  visitorIntelligenceHandler,
  i18nHandler,
  authHandler,
} from "./shared/lib/middleware/handlers";
import { updateSession } from "./shared/lib/supabase/middleware";

const pipeline = createPipeline([
  visitorIntelligenceHandler,
  i18nHandler,
  authHandler,
]);

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const traceId = logger.startTrace(`middleware:${request.nextUrl.pathname}`);
  logger.startGroup(
    `[Middleware v13.0] Procesando: ${request.method} ${request.nextUrl.pathname}`
  );

  let response: NextResponse;

  try {
    const supabaseResponse = await updateSession(request);
    logger.traceEvent(traceId, "Manejador de sesión de Supabase completado.");

    // El pipeline ahora se invoca directamente, sin adaptadores complejos.
    response = await pipeline(request);
    logger.traceEvent(traceId, "Pipeline principal ejecutado con éxito.");

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });
    logger.traceEvent(
      traceId,
      "Cookies de sesión sincronizadas en la respuesta final."
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error desconocido en el pipeline.";
    logger.error("[Middleware] Error no controlado.", {
      error: errorMessage,
      traceId,
    });
    response = new NextResponse("Internal Server Error", { status: 500 });
  }

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-insights.com; style-src 'self' 'unsafe-inline'; img-src * blob: data:; media-src 'self' res.cloudinary.com; connect-src *; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self';"
  );
  logger.traceEvent(
    traceId,
    "Cabeceras de seguridad aplicadas a la respuesta final."
  );

  logger.success(
    `[Middleware] Pipeline completado. Estado: ${response.status}`,
    { traceId }
  );
  logger.endGroup();
  logger.endTrace(traceId);
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
