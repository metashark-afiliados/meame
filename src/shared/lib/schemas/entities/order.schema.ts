// shared/lib/schemas/entities/order.schema.ts
/**
 * @file order.schema.ts
 * @description SSoT para el contrato de datos de la entidad Pedido (Order).
 *              Define la estructura para un documento en la colección 'orders' de MongoDB.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { logger } from "@/shared/lib/logging";

logger.trace("[Schema] Definiendo contrato de élite para la entidad [Order] v1.0.0");

/**
 * @const OrderItemSchema
 * @description Valida un único ítem dentro de un pedido. Es una instantánea del producto en el momento de la compra.
 */
const OrderItemSchema = z.object({
  productId: z.string().describe("ID del producto en nuestro sistema."),
  variantId: z.string().describe("ID de la variante del producto."),
  name: z.string().describe("Nombre del producto en el momento de la compra."),
  quantity: z
    .number()
    .int()
    .positive("La cantidad debe ser al menos 1."),
  price: z
    .number()
    .positive("El precio debe ser un número positivo.")
    .describe("Precio por unidad en el momento de la compra."),
});

/**
 * @const OrderSchema
 * @description El schema principal y soberano para un pedido en nuestro ecosistema.
 */
export const OrderSchema = z.object({
  // --- Metadatos de Identificación ---
  orderId: z.string().cuid2({ message: "El ID de pedido debe ser un CUID2 válido." }),
  stripePaymentIntentId: z.string().startsWith("pi_").describe("ID de referencia de la transacción en Stripe."),
  userId: z.string().optional().describe("ID del usuario de Supabase, si está autenticado."),

  // --- Detalles Financieros ---
  amount: z.number().positive("El monto total debe ser positivo."),
  currency: z.string().length(3, "El código de moneda debe tener 3 caracteres.").toLowerCase(),

  // --- Estado del Pedido ---
  status: z.enum(["pending", "succeeded", "failed"]).default("pending"),

  // --- Información del Cliente ---
  customerEmail: z.string().email("Debe ser un email válido."),

  // --- Contenido del Pedido (Denormalizado) ---
  items: z.array(OrderItemSchema).min(1, "Un pedido debe tener al menos un ítem."),

  // --- Timestamps ---
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * @type Order
 * @description Infiere el tipo TypeScript para un pedido completo y validado.
 */
export type Order = z.infer<typeof OrderSchema>;

/**
 * @type OrderItem
 * @description Infiere el tipo TypeScript para un ítem de pedido.
 */
export type OrderItem = z.infer<typeof OrderItemSchema>;
// shared/lib/schemas/entities/order.schema.ts
