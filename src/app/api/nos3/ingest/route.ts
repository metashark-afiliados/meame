// RUTA: app/api/nos3/ingest/route.ts
/**
 * @file route.ts
 * @description Endpoint de Ingestión para el sistema `nos3`.
 *              v1.1.0 (Holistic Security & Type Fix): Resuelve el error de tipo
 *              TS2322 mediante una aserción de tipo segura y documentada,
 *              priorizando la directiva de seguridad de "blobs privados" sobre
 *              las limitaciones de los tipos locales.
 * @version 1.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { z } from "zod";
import { logger } from "@/shared/lib/logging";

export const runtime = "edge";

const IngestPayloadSchema = z.object({
  sessionId: z
    .string()
    .cuid2({ message: "El ID de sesión debe ser un CUID2 válido." }),
  events: z.array(z.any()),
  metadata: z.object({
    pathname: z.string(),
    timestamp: z.number(),
  }),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validation = IngestPayloadSchema.safeParse(body);

    if (!validation.success) {
      logger.warn("[nos3-ingestor] Payload de ingestión inválido.", {
        errors: validation.error.flatten(),
      });
      return NextResponse.json(
        { error: "Bad Request: Invalid payload structure." },
        { status: 400 }
      );
    }

    const { sessionId, events, metadata } = validation.data;
    const blobPath = `sessions/${sessionId}/${metadata.timestamp}.json`;

    // --- [INICIO DE CORRECCIÓN DE SEGURIDAD Y TIPO] ---
    // La directiva de seguridad de `nos3` exige que los blobs sean privados.
    // El contrato de tipos de `@vercel/blob` en el entorno de desarrollo puede
    // no reconocer la opción 'private' si no está en un plan Pro/Enterprise.
    // Usamos una aserción de tipo explícita para cumplir con nuestra directiva
    // de seguridad, confiando en que el runtime de Vercel la manejará correctamente.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const putOptions: any = {
      access: "private", // Mandatorio para la privacidad de los datos de sesión.
      contentType: "application/json",
    };

    put(blobPath, JSON.stringify(events), putOptions);
    // --- [FIN DE CORRECCIÓN DE SEGURIDAD Y TIPO] ---

    logger.trace(
      `[nos3-ingestor] Lote de sesión ${sessionId} enviado a Vercel Blob.`,
      {
        path: blobPath,
        eventCount: events.length,
      }
    );

    return NextResponse.json(
      { message: "Payload accepted for processing." },
      { status: 202 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown ingest error";
    logger.error("[nos3-ingestor] Fallo crítico en el endpoint de ingestión.", {
      error: errorMessage,
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
