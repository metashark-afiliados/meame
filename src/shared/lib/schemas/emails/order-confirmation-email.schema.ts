// shared/lib/schemas/emails/order-confirmation-email.schema.ts
/**
 * @file order-confirmation-email.schema.ts
 * @description SSoT para el contrato de datos del contenido i18n de la plantilla
 *              de email de confirmación de pedido.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";

export const OrderConfirmationEmailContentSchema = z.object({
  previewText: z
    .string()
    .includes("{{orderId}}", { message: "Debe incluir el placeholder {{orderId}}" }),
  title: z.string(),
  greeting: z.string(),
  summaryLabel: z.string(),
  totalLabel: z.string(),
});

export const OrderConfirmationEmailLocaleSchema = z.object({
  orderConfirmationEmail: OrderConfirmationEmailContentSchema.optional(),
});
// shared/lib/schemas/emails/order-confirmation-email.schema.ts
