// RUTA: src/shared/lib/middleware/engine/pipeline.ts
/**
 * @file pipeline.ts
 * @description Orquestador de middleware atómico y soberano, compatible con Vercel Edge Runtime.
 *              v3.0.0 (Architectural Integrity Restoration): Restaurado a su lógica
 *              original de cortocircuito, desacoplándolo del motor de build transaccional.
 * @version 3.0.0
 *@author RaZ Podestá - MetaShark Tech
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

      // Lógica de Cortocircuito: Si un manejador devuelve una redirección o reescritura,
      // el pipeline se detiene y devuelve esa respuesta inmediatamente.
      if (
        (result.status >= 300 && result.status < 400) ||
        result.headers.get("x-middleware-rewrite")
      ) {
        logger.info(
          `[Pipeline] Manejador '${handlerName}' ha cortocircuitado el pipeline.`
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
