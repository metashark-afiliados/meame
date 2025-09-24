// shared/lib/schemas/notifications/transactional.schema.ts
/**
 * @file transactional.schema.ts
 * @description SSoT para los contratos de datos de los payloads de emails transaccionales.
 *              v2.0.0 (Order Items Integration): Se alinea el contrato de
 *              confirmación de pedido con los requisitos de la plantilla de email,
 *              incluyendo la lista de items del pedido.
 * @version 2.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { OrderItemSchema } from "@/shared/lib/schemas/entities/order.schema";

/**
 * @const OrderConfirmationPayloadSchema
 * @description Valida el payload para el email de confirmación de pedido.
 */
export const OrderConfirmationPayloadSchema = z.object({
  to: z.string().email("El destinatario debe ser un email válido."),
  orderId: z.string().min(1, "Se requiere un ID de pedido."),
  totalAmount: z.string().min(1, "Se requiere un monto total."),
  // --- [INICIO DE CORRECCIÓN DE CONTRATO] ---
  items: z
    .array(OrderItemSchema)
    .min(1, "Un email de confirmación debe tener al menos un ítem."),
  // --- [FIN DE CORRECIÓQN DE CONTRATO] ---
});

export type OrderConfirmationPayload = z.infer<
  typeof OrderConfirmationPayloadSchema
>;
// shared/lib/schemas/notifications/transactional.schema.ts
