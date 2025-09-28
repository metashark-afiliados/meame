// RUTA: src/app/api/webhooks/stripe/route.ts
/**
 * @file route.ts
 * @description Endpoint de API de élite y SSoT para recibir y manejar webhooks de Stripe.
 *              Este aparato es el guardián de la confirmación de pagos y el
 *              orquestador de la lógica post-compra. Ahora persistente en Supabase.
 * @version 6.0.0 (Migración a Supabase)
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
// Se elimina la importación de MongoDB
// import { connectToDatabase } from "@/shared/lib/mongodb";
import { createServerClient } from "@/shared/lib/supabase/server"; // Importar el cliente Supabase
import {
  OrderSchema,
  type Order,
  type OrderItem,
} from "@/shared/lib/schemas/entities/order.schema";

// --- Guardias de Configuración a Nivel de Módulo ---
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY no está definido.");
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET no está definido.");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const traceId = logger.startTrace("stripeWebhook_v6.0_Supabase");
  logger.info("[Stripe Webhook v6.0] Evento entrante recibido...", { traceId });

  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;
  let event: Stripe.Event;

  // --- Pilar VI: Resiliencia (Verificación de Firma) ---
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
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.traceEvent(
          traceId,
          `Procesando pago exitoso: ${paymentIntent.id}`
        );

        const cartId = paymentIntent.metadata.cartId;
        // Asumimos que el userId podría venir en el metadata si la compra la inició un usuario autenticado
        const userId = paymentIntent.metadata.userId || null;

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
          orderId: createId(), // Generar un CUID2 para el orderId lógico
          stripePaymentIntentId: paymentIntent.id,
          userId: userId, // Puede ser null
          amount: paymentIntent.amount / 100, // Stripe devuelve en céntimos
          currency: paymentIntent.currency.toUpperCase(),
          status: "succeeded",
          customerEmail: paymentIntent.receipt_email!,
          items: orderItems, // JSONB
          createdAt: now,
          updatedAt: now,
        };

        const validatedOrder = OrderSchema.parse(orderDocumentData);
        logger.traceEvent(traceId, "Documento de la orden validado con Zod.");

        // --- INTERACCIÓN CON SUPABASE ---
        const supabase = createServerClient(); // Obtener el cliente de Supabase
        const { data: insertedOrder, error: insertError } = await supabase
          .from("commerce_orders")
          .insert({
            id: validatedOrder.orderId, // Mapear orderId de Zod a id de la tabla Supabase
            stripe_payment_intent_id: validatedOrder.stripePaymentIntentId,
            user_id: validatedOrder.userId,
            amount: validatedOrder.amount,
            currency: validatedOrder.currency,
            status: validatedOrder.status,
            customer_email: validatedOrder.customerEmail,
            items: validatedOrder.items, // JSONB
            created_at: validatedOrder.createdAt,
            updated_at: validatedOrder.updatedAt,
          })
          .select("id") // Seleccionar el ID insertado
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
        // --- FIN INTERACCIÓN CON SUPABASE ---

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
