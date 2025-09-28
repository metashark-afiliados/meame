// RUTA: src/app/api/aura/ingest/route.ts
/**
 * @file route.ts
 * @description Endpoint de API de Vercel Edge para la ingesta de eventos de "Aura",
 *              ahora con encriptación en reposo para los payloads.
 * @version 2.0.0 (Payload Encryption)
 * @author RaZ Podestá - MetaShark Tech
 */
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/shared/lib/supabase/server";
import { logger } from "@/shared/lib/logging";
import { AuraIngestPayloadSchema } from "@/shared/lib/schemas/analytics/aura.schema";
import { encryptServerData } from "@/shared/lib/utils/server-encryption"; // Importar la utilidad de encriptación

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const traceId = logger.startTrace("auraIngestEndpoint_v2.0_Encryption");
  logger.info(
    "[Aura Ingest] Evento entrante recibido, iniciando procesamiento con encriptación...",
    { traceId }
  );

  try {
    // 1. Obtener el contexto de la sesión de forma segura
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Obtener el workspaceId desde una cabecera personalizada (o cookie)
    const workspaceId = request.headers.get("x-workspace-id");

    if (!workspaceId) {
      logger.warn("[Aura Ingest] Petición recibida sin workspaceId.", {
        traceId,
      });
      return new NextResponse("Workspace ID is required", { status: 400 });
    }

    // 2. Validar el payload
    const body = await request.json();
    const validation = AuraIngestPayloadSchema.safeParse(body);

    if (!validation.success) {
      logger.warn("[Aura Ingest] Payload de ingesta inválido.", {
        errors: validation.error.flatten(),
        traceId,
      });
      return new NextResponse("Bad Request: Invalid payload", { status: 400 });
    }

    // 3. Enriquecer y ENCRIPTAR los eventos con datos del servidor
    const eventsToInsert = validation.data.events.map((event) => {
      // Convertir el payload a string JSON y encriptarlo
      const encryptedPayload = encryptServerData(JSON.stringify(event.payload));
      return {
        session_id: event.sessionId,
        user_id: user?.id || null, // El user_id es del servidor, no del cliente
        workspace_id: workspaceId,
        campaign_id: event.campaignId,
        variant_id: event.variantId,
        event_type: event.eventType,
        payload: encryptedPayload, // <-- Payload ENCRIPTADO
        created_at: new Date(event.timestamp).toISOString(),
      };
    });

    // 4. Persistir en la base de datos
    // Supabase permite insertar JSON strings directamente en columnas JSONB
    const { error } = await supabase
      .from("anonymous_campaign_events")
      .insert(eventsToInsert);
    // Nota: Aquí se inserta en anonymous_campaign_events. Si es un user logueado,
    // se podría redirigir a visitor_campaign_events o tener una lógica de inserción condicional.
    // Para simplificar esta etapa de encriptación, se mantiene la inserción inicial aquí.
    // La distinción entre anon/visitor_campaign_events se haría en use-aura-tracker.ts
    // o en una función de base de datos.

    if (error) {
      logger.error(
        "[Aura Ingest] Error de Supabase al insertar eventos encriptados.",
        {
          error: error.message,
          traceId,
        }
      );
      throw new Error(`Supabase insert error: ${error.message}`);
    }

    logger.success(
      `[Aura Ingest] Lote de ${eventsToInsert.length} eventos encriptados procesado con éxito.`,
      { traceId }
    );
    return new NextResponse("Payload accepted", { status: 202 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(
      "[Aura Ingest] Fallo crítico en el endpoint de ingesta con encriptación.",
      {
        error: errorMessage,
        traceId,
      }
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    logger.endTrace(traceId);
  }
}
