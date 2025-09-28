// RUTA: src/shared/lib/actions/analytics/getDecryptedEventsForDebug.action.ts
/**
 * @file getDecryptedEventsForDebug.action.ts
 * @description Server Action para obtener eventos de campaña encriptados, desencriptar
 *              sus payloads y devolverlos para depuración/análisis.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { z } from "zod";
import { createServerClient } from "@/shared/lib/supabase/server";
import { logger } from "@/shared/lib/logging";
import { decryptServerData } from "@/shared/lib/utils/server-encryption";
import {
  AuraEventSchema, // Schema del evento tal como se espera una vez desencriptado
  type AuraEventPayload,
} from "@/shared/lib/schemas/analytics/aura.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";

interface GetDecryptedEventsInput {
  campaignId: string;
  sessionId?: string; // Para eventos de visitante anónimo (fingerprint_id) o usuario (session_id)
  userId?: string; // Para eventos de usuario autenticado
  limit?: number;
  page?: number;
}

export async function getDecryptedEventsForDebugAction(
  input: GetDecryptedEventsInput
): Promise<ActionResult<{ events: AuraEventPayload[]; total: number }>> {
  const traceId = logger.startTrace("getDecryptedEventsForDebugAction_v1.0");
  logger.info(
    "[Analytics Action] Solicitando eventos encriptados para depuración...",
    { input, traceId }
  );

  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !input.sessionId) {
    // Si no hay usuario y no se especifica una sesión (para anónimos)
    logger.warn(
      "[Analytics Action] Intento no autorizado de obtener eventos encriptados (requiere autenticación o sessionId).",
      { traceId }
    );
    return { success: false, error: "auth_required" };
  }

  try {
    const { campaignId, sessionId, userId, limit = 20, page = 1 } = input;
    const offset = (page - 1) * limit;

    let queryBuilder;
    let targetTable: "anonymous_campaign_events" | "visitor_campaign_events";

    // Decide qué tabla consultar
    if (userId) {
      // Si se proporciona userId, buscamos en visitor_campaign_events
      targetTable = "visitor_campaign_events";
      queryBuilder = supabase
        .from(targetTable)
        .select("*, count()", { count: "exact" })
        .eq("user_id", userId)
        .eq("campaign_id", campaignId);
    } else if (sessionId) {
      // Si se proporciona sessionId (para anónimos)
      targetTable = "anonymous_campaign_events";
      queryBuilder = supabase
        .from(targetTable)
        .select("*, count()", { count: "exact" })
        .eq("session_id", sessionId)
        .eq("campaign_id", campaignId);
    } else {
      throw new Error(
        "Se requiere un userId o sessionId para obtener eventos."
      );
    }

    const { data, error, count } = await queryBuilder
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error(
        `[Analytics Action] Error al obtener eventos encriptados de la tabla ${targetTable}.`,
        {
          error: error.message,
          traceId,
        }
      );
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      logger.warn(
        `[Analytics Action] No se encontraron eventos encriptados para la campaña ${campaignId} en la tabla ${targetTable}.`,
        { traceId }
      );
      return { success: true, data: { events: [], total: 0 } };
    }

    const decryptedEvents: AuraEventPayload[] = data.map((event: any) => {
      try {
        const decryptedPayloadString = decryptServerData(event.payload);
        const decryptedPayloadObject = JSON.parse(decryptedPayloadString);
        // Validar el payload desencriptado contra su schema original si es posible
        const validation = AuraEventSchema.pick({
          eventType: true,
          payload: true,
          sessionId: true,
          campaignId: true,
          variantId: true,
          timestamp: true,
        }).safeParse({
          eventType: event.event_type,
          payload: decryptedPayloadObject,
          sessionId: event.session_id,
          campaignId: event.campaign_id,
          variantId: event.variant_id,
          timestamp: new Date(event.created_at).getTime(),
        });

        if (!validation.success) {
          logger.error(
            "[Analytics Action] Payload desencriptado inválido según el esquema. Devolviendo raw.",
            {
              eventId: event.id,
              errors: validation.error.flatten(),
              traceId,
            }
          );
          return {
            // Devolver el payload desencriptado raw si falla la validación del objeto interno
            eventType: event.event_type,
            sessionId: event.session_id,
            campaignId: event.campaign_id,
            variantId: event.variant_id,
            timestamp: new Date(event.created_at).getTime(),
            payload: decryptedPayloadObject,
          };
        }
        return validation.data;
      } catch (decryptError) {
        logger.error(
          "[Analytics Action] Fallo al desencriptar/parsear payload de evento.",
          {
            eventId: event.id,
            decryptError:
              decryptError instanceof Error
                ? decryptError.message
                : String(decryptError),
            traceId,
          }
        );
        return {
          // Devolver un objeto de error para este evento
          eventType: event.event_type,
          sessionId: event.session_id,
          campaignId: event.campaign_id,
          variantId: event.variant_id,
          timestamp: new Date(event.created_at).getTime(),
          payload: { error: "Failed to decrypt or parse payload" },
        };
      }
    });

    logger.success(
      `[Analytics Action] ${decryptedEvents.length} eventos desencriptados para depuración.`,
      { traceId }
    );
    return {
      success: true,
      data: { events: decryptedEvents, total: count ?? 0 },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(
      "[Analytics Action] Fallo crítico al obtener eventos desencriptados para depuración.",
      {
        error: errorMessage,
        traceId,
      }
    );
    return {
      success: false,
      error: `No se pudieron obtener los eventos desencriptados: ${errorMessage}`,
    };
  } finally {
    logger.endTrace(traceId);
  }
}
