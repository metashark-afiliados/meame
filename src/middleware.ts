// Ruta correcta: src/middleware.ts
/**
 * @file middleware.ts
 * @description Guardián de la puerta de entrada de la aplicación. Orquesta un pipeline
 *              de manejadores para la inteligencia del visitante, internacionalización
 *              y autenticación, ejecutándose en el Edge Runtime de Vercel.
 *              v8.0.0 (Logging SSoT Alignment): Se corrige la importación del logger
 *              para apuntar al módulo isomórfico consolidado, resolviendo un error
 *              crítico de build.
 * @version 8.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { type NextRequest, NextResponse } from "next/server";

// --- INICIO DE CORRECCIÓN ARQUITECTÓNICA ---
// Se actualiza la importación para apuntar a la SSoT de logging consolidada.
import { logger } from "./shared/lib/logging";
// --- FIN DE CORRECCIÓN ARQUITECTÓNICA ---
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
  const traceId = logger.startTrace("middleware-pipeline");
  logger.startGroup(
    `[Middleware Pipeline] Procesando: ${request.nextUrl.pathname}`
  );
  const response = await pipeline(request);
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
// Ruta correcta: src/middleware.ts
