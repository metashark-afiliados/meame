// RUTA: src/app/api/webhooks/stripe/route.ts
/**
 * @file route.ts
 * @description Endpoint de API de élite y SSoT para recibir y manejar webhooks de Stripe.
 *              Este aparato es el guardián de la confirmación de pagos y el
 *              orquestador de la lógica post-compra.
 * @version 6.1.0 (Type-Safe Nullability Fix)
 *@author RaZ Podestá - MetaShark Tech
 */
"use server";

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import Stripe from "stripe";
import { logger } from "@/shared/lib/logging";
import { sendOrderConfirmationEmailAction } from "@/shared/lib/actions/notifications/send-order-confirmation.action";
import { getShopifyCart } from "@/shared/lib/shopify";
import { createServerClient } from "@/shared/lib/supabase/server";
import {
  OrderSchema,
  type Order,
  type OrderItem,
} from "@/shared/lib/schemas/entities/order.schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY no está definido.");
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET no está definido.");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const traceId = logger.startTrace("stripeWebhook_v6.1_TypeSafe");
  logger.info("[Stripe Webhook v6.1] Evento entrante recibido...", { traceId });

  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logger.traceEvent(traceId, "Firma de Webhook verificada con éxito.");
  } catch (err) {
    const errorMessage = `Falló la verificación de la firma: ${(err as Error).message}`;
    logger.error(`[Stripe Webhook] ${errorMessage}`, { traceId });
    logger.endTrace(traceId, { error: errorMessage });
    return new NextResponse(errorMessage, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.traceEvent(
          traceId,
          `Procesando pago exitoso: ${paymentIntent.id}`
        );

        const cartId = paymentIntent.metadata.cartId;
        // --- [INICIO DE REFACTORIZACIÓN DE TIPOS] ---
        // Se cambia `|| null` por `|| undefined` para que el tipo sea
        // `string | undefined`, cumpliendo así con el contrato de `OrderSchema`.
        const userId = paymentIntent.metadata.userId || undefined;
        // --- [FIN DE REFACTORIZACIÓN DE TIPOS] ---

        if (!cartId) {
          throw new Error(
            `PaymentIntent ${paymentIntent.id} no tiene un cartId en la metadata.`
          );
        }
        logger.traceEvent(traceId, `Carrito asociado: ${cartId}`);

        const cart = await getShopifyCart(cartId);
        if (!cart) {
          throw new Error(`Carrito con ID ${cartId} no encontrado en Shopify.`);
        }

        const now = new Date().toISOString();
        const orderItems: OrderItem[] = cart.lines.map((line) => ({
          productId: line.merchandise.product.id,
          variantId: line.merchandise.id,
          name: line.merchandise.product.title,
          quantity: line.quantity,
          price: parseFloat(line.cost.totalAmount.amount),
        }));

        const orderDocumentData: Order = {
          orderId: createId(),
          stripePaymentIntentId: paymentIntent.id,
          userId: userId,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          status: "succeeded",
          customerEmail: paymentIntent.receipt_email!,
          items: orderItems,
          createdAt: now,
          updatedAt: now,
        };

        const validatedOrder = OrderSchema.parse(orderDocumentData);
        logger.traceEvent(traceId, "Documento de la orden validado con Zod.");

        const supabase = createServerClient();
        const { data: insertedOrder, error: insertError } = await supabase
          .from("commerce_orders")
          .insert({
            id: validatedOrder.orderId,
            stripe_payment_intent_id: validatedOrder.stripePaymentIntentId,
            user_id: validatedOrder.userId,
            amount: validatedOrder.amount,
            currency: validatedOrder.currency,
            status: validatedOrder.status,
            customer_email: validatedOrder.customerEmail,
            items: validatedOrder.items,
            created_at: validatedOrder.createdAt,
            updated_at: validatedOrder.updatedAt,
          })
          .select("id")
          .single();

        if (insertError) {
          logger.error(
            "[Stripe Webhook] Error de Supabase al insertar la orden.",
            {
              error: insertError.message,
              validatedOrder,
              traceId,
            }
          );
          throw new Error(insertError.message);
        }

        logger.success(
          `[Stripe Webhook] Orden ${insertedOrder.id} persistida en Supabase.`,
          { traceId, supabaseOrderId: insertedOrder.id }
        );

        const emailResult = await sendOrderConfirmationEmailAction({
          to: validatedOrder.customerEmail,
          orderId: validatedOrder.orderId,
          totalAmount: new Intl.NumberFormat("it-IT", {
            style: "currency",
            currency: validatedOrder.currency,
          }).format(validatedOrder.amount),
          items: validatedOrder.items,
        });

        if (!emailResult.success) {
          logger.error(
            "[Stripe Webhook] Orden persistida pero falló el envío del email de confirmación.",
            {
              orderId: validatedOrder.orderId,
              error: emailResult.error,
              traceId,
            }
          );
        } else {
          logger.traceEvent(
            traceId,
            "Email de confirmación despachado con éxito."
          );
        }
        break;
      }
      default:
        logger.trace(
          `[Stripe Webhook] Evento no manejado de tipo: ${event.type}`,
          { traceId }
        );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[Stripe Webhook] Error inesperado al procesar el evento.", {
      eventType: event.type,
      error: errorMessage,
      traceId,
    });
    logger.endTrace(traceId, { error: errorMessage });
    return new NextResponse("Error interno del servidor.", { status: 500 });
  }

  logger.endTrace(traceId);
  return NextResponse.json({ received: true });
}
