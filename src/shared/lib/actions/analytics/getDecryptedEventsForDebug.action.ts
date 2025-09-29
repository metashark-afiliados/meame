// RUTA: src/shared/lib/actions/analytics/getDecryptedEventsForDebug.action.ts
/**
 * @file getDecryptedEventsForDebug.action.ts
 * @description Server Action para obtener y desencriptar eventos de campaña.
 * @version 1.2.0 (Elite Code Hygiene Restoration)
 * @author L.I.A. Legacy - Asistente de Refactorización
 */
"use server";

import { createServerClient } from "@/shared/lib/supabase/server";
import { logger } from "@/shared/lib/logging";
import { decryptServerData } from "@/shared/lib/utils/server-encryption";
import {
  AuraEventSchema,
  type AuraEventPayload,
} from "@/shared/lib/schemas/analytics/aura.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";

interface SupabaseEventRecord {
  id: string;
  session_id: string;
  user_id: string | null;
  workspace_id: string;
  campaign_id: string;
  variant_id: string;
  event_type: string;
  payload: string;
  created_at: string;
}

interface GetDecryptedEventsInput {
  campaignId: string;
  sessionId?: string;
  userId?: string;
  limit?: number;
  page?: number;
}

export async function getDecryptedEventsForDebugAction(
  input: GetDecryptedEventsInput
): Promise<ActionResult<{ events: AuraEventPayload[]; total: number }>> {
  const traceId = logger.startTrace("getDecryptedEventsForDebugAction_v1.2");
  logger.info("[Analytics Action] Solicitando eventos encriptados...", {
    input,
    traceId,
  });

  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !input.sessionId) {
    return { success: false, error: "auth_required" };
  }

  try {
    const { campaignId, sessionId, userId, limit = 20, page = 1 } = input;
    const offset = (page - 1) * limit;

    let queryBuilder;
    let targetTable: "anonymous_campaign_events" | "visitor_campaign_events";

    if (userId) {
      targetTable = "visitor_campaign_events";
      queryBuilder = supabase
        .from(targetTable)
        .select("*, count()", { count: "exact" })
        .eq("user_id", userId)
        .eq("campaign_id", campaignId);
    } else if (sessionId) {
      targetTable = "anonymous_campaign_events";
      queryBuilder = supabase
        .from(targetTable)
        .select("*, count()", { count: "exact" })
        .eq("session_id", sessionId)
        .eq("campaign_id", campaignId);
    } else {
      throw new Error("Se requiere un userId o sessionId.");
    }

    const { data, error, count } = await queryBuilder
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    if (!data) return { success: true, data: { events: [], total: 0 } };

    const decryptedEvents: AuraEventPayload[] = data.map(
      (event: SupabaseEventRecord) => {
        try {
          const decryptedPayloadString = decryptServerData(event.payload);
          const decryptedPayloadObject = JSON.parse(decryptedPayloadString);
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
            return {
              eventType: event.event_type,
              sessionId: event.session_id,
              campaignId: event.campaign_id,
              variantId: event.variant_id,
              timestamp: new Date(event.created_at).getTime(),
              payload: decryptedPayloadObject,
            };
          }
          return validation.data;
        } catch {
          // --- CORRECCIÓN DE HIGIENE DE CÓDIGO APLICADA AQUÍ ---
          return {
            eventType: event.event_type,
            sessionId: event.session_id,
            campaignId: event.campaign_id,
            variantId: event.variant_id,
            timestamp: new Date(event.created_at).getTime(),
            payload: { error: "Failed to decrypt or parse payload" },
          };
        }
      }
    );

    return {
      success: true,
      data: { events: decryptedEvents, total: count ?? 0 },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `No se pudieron obtener los eventos: ${errorMessage}`,
    };
  } finally {
    logger.endTrace(traceId);
  }
}
