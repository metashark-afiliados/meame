// RUTA: src/shared/lib/middleware/engine/pipeline.ts
/**
 * @file pipeline.ts
 * @description Orquestador de middleware atómico y compatible con Vercel Edge Runtime.
 *              v1.2.0 (Module Resolution Fix): Utiliza rutas relativas para
 *              garantizar una resolución de módulos robusta en el Edge.
 * @version 1.2.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { NextRequest, NextResponse } from "next/server";
// --- [INICIO DE REFACTORIZACIÓN DE RUTAS] ---
import { logger } from "@/shared/lib/logging";
// --- [FIN DE REFACTORIZACIÓN DE RUTAS] ---

export type MiddlewareHandler = (
  req: NextRequest,
  res: NextResponse
) => NextResponse | Promise<NextResponse>;

export function createPipeline(
  handlers: MiddlewareHandler[]
): (req: NextRequest) => Promise<NextResponse> {
  return async function (req: NextRequest): Promise<NextResponse> {
    let currentResponse = NextResponse.next();

    for (const handler of handlers) {
      try {
        const result = await handler(req, currentResponse);
        currentResponse = result;

        if (
          result.headers.get("x-middleware-rewrite") ||
          result.headers.get("Location")
        ) {
          logger.trace(
            `[Pipeline] Manejador '${handler.name}' ha cortocircuitado el pipeline.`
          );
          return result;
        }
      } catch (error) {
        console.error(`[Pipeline] Error en el manejador '${handler.name}':`, {
          error,
        });
        return new NextResponse("Internal Server Error", { status: 500 });
      }
    }
    return currentResponse;
  };
}
