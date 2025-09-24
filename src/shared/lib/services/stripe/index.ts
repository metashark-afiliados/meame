// shared/lib/stripe/index.ts
/**
 * @file index.ts
 * @description Capa de Acceso a Datos (DAL) soberana para Stripe.
 * @version 2.0.0 (Metadata Support)
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import Stripe from "stripe";
import { logger } from "@/shared/lib/logging";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "Error Crítico: La variable de entorno STRIPE_SECRET_KEY no está definida."
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
  typescript: true,
});

/**
 * @function createPaymentIntent
 * @description Crea una intención de pago en Stripe.
 * @param amount - El monto en la unidad más pequeña (ej. céntimos).
 * @param currency - El código de moneda (ej. 'eur').
 * @param metadata - Un objeto de metadatos para adjuntar al PaymentIntent.
 * @returns {Promise<Stripe.PaymentIntent>}
 */
export async function createPaymentIntent(
  amount: number,
  currency: string,
  metadata: Stripe.MetadataParam // <-- TIPO ACTUALIZADO
): Promise<Stripe.PaymentIntent> {
  logger.info("[Stripe DAL] Creando PaymentIntent v2.0...", {
    amount,
    currency,
    metadata,
  });
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata, // <-- METADATA INCLUIDA
    });
    logger.success("[Stripe DAL] PaymentIntent creado con éxito.", {
      id: paymentIntent.id,
    });
    return paymentIntent;
  } catch (error) {
    logger.error("[Stripe DAL] Fallo al crear el PaymentIntent.", { error });
    throw new Error("No se pudo iniciar la sesión de pago con Stripe.");
  }
}
// shared/lib/stripe/index.ts
