// RUTA: src/middleware.ts
/**
 * @file middleware.ts
 * @description Guardián de la puerta de entrada, alineado con el contrato del pipeline v4.0.
 * @version 15.0.0 (Pipeline Contract Alignment)
 * @author L.I.A. Legacy
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
    `[Middleware v15.0] Procesando: ${request.method} ${request.nextUrl.pathname}`
  );

  try {
    // 1. Obtener la respuesta inicial del manejador de sesión de Supabase.
    const supabaseResponse = await updateSession(request);
    logger.traceEvent(traceId, "Manejador de sesión de Supabase completado.");

    // 2. Pasar la petición y la respuesta inicial a través del pipeline principal.
    const finalResponse = await pipeline(request, supabaseResponse);
    logger.traceEvent(traceId, "Pipeline principal ejecutado con éxito.");

    logger.success(
      `[Middleware] Pipeline completado. Estado final: ${finalResponse.status}`,
      { traceId }
    );
    return finalResponse;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error desconocido en el middleware.";
    logger.error("[Middleware] Error no controlado.", {
      error: errorMessage,
      traceId,
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
