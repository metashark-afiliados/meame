// Ruta correcta: src/shared/lib/actions/commerce/checkout.action.ts
/**
 * @file checkout.action.ts
 * @description Server Action para orquestar el proceso de checkout.
 * @version 2.1.0 (Sovereign Path Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { getCart } from "@/shared/lib/commerce/cart";
import { createPaymentIntent } from "@/shared/lib/services/stripe";

interface CheckoutSessionPayload {
  clientSecret: string | null;
}

export async function createCheckoutSessionAction(): Promise<
  ActionResult<CheckoutSessionPayload>
> {
  const traceId = logger.startTrace("createCheckoutSessionAction_v2.1");
  logger.info("[Checkout Action] Iniciando sesión de checkout v2.1...", {
    traceId,
  });

  const cart = await getCart();

  if (!cart || cart.lines.length === 0) {
    logger.warn("[Checkout Action] Intento de checkout con carrito vacío.", {
      traceId,
    });
    return { success: false, error: "Tu carrito está vacío." };
  }

  const amountInCents = Math.round(
    parseFloat(cart.cost.totalAmount.amount) * 100
  );
  const currency = cart.cost.totalAmount.currencyCode;

  try {
    const metadata = { cartId: cart.id };
    logger.traceEvent(
      traceId,
      "Inyectando metadatos en PaymentIntent.",
      metadata
    );

    const paymentIntent = await createPaymentIntent(
      amountInCents,
      currency,
      metadata
    );

    logger.success("[Checkout Action] PaymentIntent creado con metadatos.", {
      paymentIntentId: paymentIntent.id,
      traceId,
    });
    return {
      success: true,
      data: { clientSecret: paymentIntent.client_secret },
    };
  } catch (error) {
    logger.error("[Checkout Action] Fallo al crear PaymentIntent.", {
      error,
      traceId,
    });
    return { success: false, error: "No se pudo iniciar el proceso de pago." };
  } finally {
    logger.endTrace(traceId);
  }
}
// Ruta correcta: src/shared/lib/actions/commerce/checkout.action.ts
