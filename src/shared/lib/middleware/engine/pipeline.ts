// RUTA: src/shared/lib/middleware/engine/pipeline.ts
/**
 * @file pipeline.ts
 * @description Orquestador de middleware atómico y compatible con Vercel Edge Runtime.
 * @version 2.0.0 (Granular Logging & Observability)
 * @author L.I.A. Legacy
 */
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/shared/lib/logging";

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
      const handlerName = handler.name || "anonymousHandler";
      logger.trace(`[Pipeline] -> Ejecutando manejador: ${handlerName}...`);

      const result = await handler(req, currentResponse);
      currentResponse = result;

      // Un manejador ha devuelto una redirección o una reescritura,
      // lo que significa que ha tomado control del flujo.
      if (
        (result.status >= 300 && result.status < 400) || // Redirección
        result.headers.get("x-middleware-rewrite")
      ) {
        logger.info(
          `[Pipeline] Manejador '${handlerName}' ha cortocircuitado el pipeline con una redirección/reescritura.`
        );
        return result;
      }
    }
    logger.trace(
      "[Pipeline] <- Todos los manejadores ejecutados sin cortocircuito."
    );
    return currentResponse;
  };
}
