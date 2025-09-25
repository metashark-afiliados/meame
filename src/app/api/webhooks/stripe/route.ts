// RUTA: src/app/api/webhooks/stripe/route.ts
/**
 * @file route.ts
 * @description Endpoint de API de élite y SSoT para recibir y manejar webhooks de Stripe.
 *              Este aparato es el guardián de la confirmación de pagos y el
 *              orquestador de la lógica post-compra. Está diseñado con una
 *              arquitectura de resiliencia y observabilidad de nivel de producción.
 * @version 5.0.0 (Elite Resilience & Observability)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import Stripe from "stripe";
import { logger } from "@/shared/lib/logging";
import { sendOrderConfirmationEmailAction } from "@/shared/lib/actions/notifications/send-order-confirmation.action";
import { getShopifyCart } from "@/shared/lib/shopify";
import { connectToDatabase } from "@/shared/lib/mongodb";
import {
  OrderSchema,
  type Order,
  type OrderItem,
} from "@/shared/lib/schemas/entities/order.schema";

// --- Guardias de Configuración a Nivel de Módulo ---
// Falla rápido si las variables de entorno críticas no están configuradas.
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY no está definido.");
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET no está definido.");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const traceId = logger.startTrace("stripeWebhook_v5.0");
  logger.info("[Stripe Webhook v5.0] Evento entrante recibido...", { traceId });

  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;
  let event: Stripe.Event;

  // --- Pilar VI: Resiliencia (Verificación de Firma) ---
  // Primer nivel de seguridad: si la firma es inválida, es una petición
  // maliciosa o mal configurada. No se debe procesar.
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logger.traceEvent(traceId, "Firma de Webhook verificada con éxito.");
  } catch (err) {
    const errorMessage = `Falló la verificación de la firma: ${(err as Error).message}`;
    logger.error(`[Stripe Webhook] ${errorMessage}`, { traceId });
    logger.endTrace(traceId, { error: errorMessage });
    return new NextResponse(errorMessage, { status: 400 });
  }

  // --- Pilar VI: Resiliencia (Lógica de Negocio) ---
  // Segundo nivel de seguridad: cualquier error aquí es un problema del servidor.
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.traceEvent(traceId, `Procesando pago exitoso: ${paymentIntent.id}`);

        // 1. Obtener y validar metadatos críticos
        const cartId = paymentIntent.metadata.cartId;
        if (!cartId) {
          throw new Error(`PaymentIntent ${paymentIntent.id} no tiene un cartId en la metadata.`);
        }
        logger.traceEvent(traceId, `Carrito asociado: ${cartId}`);

        // 2. Obtener datos de la fuente externa (Shopify)
        const cart = await getShopifyCart(cartId);
        if (!cart) {
          throw new Error(`Carrito con ID ${cartId} no encontrado en Shopify.`);
        }

        // 3. Transformar y construir el documento de la orden
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
          userId: undefined, // Lógica futura para vincular a usuario autenticado
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          status: "succeeded",
          customerEmail: paymentIntent.receipt_email!,
          items: orderItems,
          createdAt: now,
          updatedAt: now,
        };

        // 4. Pilar VI: Validar contra el Contrato Soberano ANTES de escribir en la DB
        const validatedOrder = OrderSchema.parse(orderDocumentData);
        logger.traceEvent(traceId, "Documento de la orden validado con Zod.");

        // 5. Persistir la orden en la base de datos
        const client = await connectToDatabase();
        const db = client.db(process.env.MONGODB_DB_NAME);
        const collection = db.collection<Order>("orders");
        await collection.insertOne(validatedOrder);

        logger.success(`[Stripe Webhook] Orden ${validatedOrder.orderId} persistida en la base de datos.`, { traceId });

        // 6. Despachar efectos secundarios (Notificación por correo)
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
          // Es un error importante, pero no debe hacer que el webhook falle,
          // ya que el pago y el pedido SÍ se procesaron.
          logger.error("[Stripe Webhook] Orden persistida pero falló el envío del email de confirmación.", {
            orderId: validatedOrder.orderId,
            error: emailResult.error,
            traceId
          });
        } else {
          logger.traceEvent(traceId, "Email de confirmación despachado con éxito.");
        }
        break;
      }
      default:
        logger.trace(`[Stripe Webhook] Evento no manejado de tipo: ${event.type}`, { traceId });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido.";
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
