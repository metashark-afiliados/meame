// Ruta correcta: src/shared/lib/actions/notifications/actions.ts
/**
 * @file actions.ts
 * @description Server Action soberana para orquestar el envío de emails transaccionales.
 * @version 2.1.0 (Sovereign Path Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { sendEmail } from "@/shared/lib/services/resend";
import { OrderConfirmationEmail } from "@/shared/emails/OrderConfirmationEmail";
import {
  OrderConfirmationPayloadSchema,
  type OrderConfirmationPayload,
} from "@/shared/lib/schemas/notifications/transactional.schema";

export type TransactionalEmailType = "order_confirmation";

const payloadSchemas = {
  order_confirmation: OrderConfirmationPayloadSchema,
};

type TransactionalEmailPayloadMap = {
  order_confirmation: OrderConfirmationPayload;
};

export async function sendTransactionalEmailAction<
  T extends TransactionalEmailType,
>(
  type: T,
  payload: TransactionalEmailPayloadMap[T]
): Promise<ActionResult<{ success: true }>> {
  const traceId = logger.startTrace("sendTransactionalEmailAction_v2.1");
  logger.info(`[Notification Action] Iniciando envío de email tipo: ${type}`, {
    to: payload.to,
    traceId,
  });

  try {
    const schema = payloadSchemas[type];
    const validation = schema.safeParse(payload);

    if (!validation.success) {
      logger.error("[Notification Action] Payload de email inválido.", {
        type,
        errors: validation.error.flatten(),
        traceId,
      });
      return { success: false, error: "Datos para el email inválidos." };
    }

    let emailComponent;
    let subject: string;
    const validatedPayload = validation.data as OrderConfirmationPayload;

    switch (type) {
      case "order_confirmation":
        subject = `Conferma del tuo ordine #${validatedPayload.orderId}`;
        emailComponent = OrderConfirmationEmail({
          payload: validatedPayload,
        });
        break;
      default:
        throw new Error(`Tipo de email transaccional no soportado: ${type}`);
    }

    const sendResult = await sendEmail(
      validatedPayload.to,
      subject,
      emailComponent
    );

    if (!sendResult.success) {
      return { success: false, error: sendResult.error };
    }

    logger.success(
      `[Notification Action] Email tipo '${type}' encolado para envío.`,
      {
        emailId: sendResult.data.emailId,
        traceId,
      }
    );
    return { success: true, data: { success: true } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "[Notification Action] Fallo crítico en la orquestación del email.",
      { error: errorMessage, traceId }
    );
    return {
      success: false,
      error: "No se pudo procesar la solicitud de envío de email.",
    };
  } finally {
    logger.endTrace(traceId);
  }
}
// Ruta correcta: src/shared/lib/actions/notifications/actions.ts
