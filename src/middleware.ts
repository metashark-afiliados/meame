// RUTA: src/middleware.ts
/**
 * @file middleware.ts
 * @description Guardián de la puerta de entrada de la aplicación. Orquesta un pipeline
 *              de manejadores para la inteligencia del visitante, internacionalización
 *              y autenticación, ejecutándose en el Edge Runtime de Vercel.
 * @version 8.0.0 (Elite Orchestration & Observability)
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

const pipeline = createPipeline([
  visitorIntelligenceHandler,
  i18nHandler,
  authHandler,
]);

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const traceId = logger.startTrace(`middleware:${request.nextUrl.pathname}`);
  logger.startGroup(
    `[Middleware Pipeline] Procesando: ${request.method} ${request.nextUrl.pathname}`,
    "color: #a855f7; font-weight: bold;"
  );

  let response: NextResponse;
  try {
    response = await pipeline(request);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido en pipeline.";
    logger.error("[Middleware] Error no controlado en el pipeline.", {
      error: errorMessage,
      traceId,
    });
    response = new NextResponse("Internal Server Error", { status: 500 });
  }

  // Aplicar cabeceras de seguridad a todas las respuestas que pasan por el middleware
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-insights.com; style-src 'self' 'unsafe-inline'; img-src * blob: data:; media-src 'self' res.cloudinary.com; connect-src *; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self';"
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
