// RUTA: src/shared/lib/services/stripe/index.ts
/**
 * @file index.ts
 * @description Capa de Acceso a Datos (DAL) soberana para Stripe.
 *              v3.0.0 (API Version Alignment & Elite Compliance): Actualizado
 *              para usar la última versión estable de la API de Stripe y
 *              reforzado con logging de élite.
 * @version 3.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import Stripe from "stripe";
import { logger } from "@/shared/lib/logging";

// --- Guardia de Configuración de Nivel de Módulo ---
if (!process.env.STRIPE_SECRET_KEY) {
  const errorMsg =
    "Error Crítico de Arquitectura: La variable de entorno STRIPE_SECRET_KEY no está definida.";
  logger.error(errorMsg);
  throw new Error(errorMsg);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // --- [INICIO DE REFACTORIZACIÓN DE ÉLITE] ---
  // Se actualiza a la versión de API requerida por el SDK v18.5.0 instalado.
  // Esto resuelve el error de tipo TS2322.
  // RECOMENDACIÓN: Actualizar el paquete 'stripe' a una versión estable.
  apiVersion: "2025-08-27.basil",
  // --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---
  typescript: true,
  appInfo: {
    name: "Meame Elite Platform",
    version: "1.0.0",
  },
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
  metadata: Stripe.MetadataParam
): Promise<Stripe.PaymentIntent> {
  const traceId = logger.startTrace("stripe.createPaymentIntent");
  logger.info("[Stripe DAL] Creando PaymentIntent v3.0...", {
    amount,
    currency,
    metadata,
    traceId,
  });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata,
    });
    logger.success("[Stripe DAL] PaymentIntent creado con éxito.", {
      id: paymentIntent.id,
      traceId,
    });
    return paymentIntent;
  } catch (error) {
    logger.error("[Stripe DAL] Fallo al crear el PaymentIntent.", {
      error,
      traceId,
    });
    throw new Error("No se pudo iniciar la sesión de pago con Stripe.");
  } finally {
    logger.endTrace(traceId);
  }
}
