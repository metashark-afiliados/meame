// app/api/webhooks/stripe/route.ts
/**
 * @file route.ts
 * @description Endpoint de API de élite para recibir y manejar webhooks de Stripe.
 * @version 3.1.0 (Lexical Scoping Fix & Elite Compliance): Resuelve violaciones
 *              de `no-case-declarations` al encapsular la lógica de cada case
 *              en su propio bloque de ámbito, garantizando la higiene del código.
 * @version 3.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import Stripe from "stripe";
import { logger } from "@/shared/lib/logging";
import { sendTransactionalEmailAction } from "@/shared/lib/notifications/actions";
import { getShopifyCart } from "@/shared/lib/shopify";
import { connectToDatabase } from "@/shared/lib/mongodb";
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
  const traceId = logger.startTrace("stripeWebhook_v3.1");
  logger.info("[Stripe Webhook v3.1] Evento entrante recibido...");

  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = `Falló la verificación de la firma: ${(err as Error).message}`;
    logger.error(`[Stripe Webhook] ${errorMessage}`, { traceId });
    return new NextResponse(errorMessage, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        // --- [INICIO DE CORRECCIÓN DE SCOPING] ---
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.success(
          `[Stripe Webhook] Pago exitoso para: ${paymentIntent.id}`
        );

        const cartId = paymentIntent.metadata.cartId;
        if (!cartId) {
          throw new Error(
            `PaymentIntent ${paymentIntent.id} no tiene un cartId en la metadata.`
          );
        }

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

        const orderDocument: Order = OrderSchema.parse({
          orderId: createId(),
          stripePaymentIntentId: paymentIntent.id,
          userId: undefined,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: "succeeded",
          customerEmail: paymentIntent.receipt_email,
          items: orderItems,
          createdAt: now,
          updatedAt: now,
        });

        const client = await connectToDatabase();
        const db = client.db(process.env.MONGODB_DB_NAME);
        const collection = db.collection<Order>("orders");
        await collection.insertOne(orderDocument);

        logger.success(
          `[Stripe Webhook] Pedido ${orderDocument.orderId} persistido.`
        );

        const emailResult = await sendTransactionalEmailAction(
          "order_confirmation",
          {
            to: orderDocument.customerEmail,
            orderId: orderDocument.orderId,
            totalAmount: new Intl.NumberFormat("it-IT", {
              style: "currency",
              currency: orderDocument.currency,
            }).format(orderDocument.amount),
            items: orderItems,
          }
        );

        if (!emailResult.success) {
          logger.error(
            "[Stripe Webhook] Pedido persistido pero falló el envío del email.",
            { orderId: orderDocument.orderId, error: emailResult.error }
          );
        }
        break;
        // --- [FIN DE CORRECCIÓN DE SCOPING] ---
      }
      default:
        logger.trace(
          `[Stripe Webhook] Evento no manejado de tipo: ${event.type}`
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
    return new NextResponse("Error interno del servidor.", { status: 500 });
  } finally {
    logger.endTrace(traceId);
  }

  return NextResponse.json({ received: true });
}
// app/api/webhooks/stripe/route.ts
