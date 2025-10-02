// RUTA: scripts/testing/test-stripe-flow.ts
/**
 * @file test-stripe-flow.ts
 * @description Guardián de Integridad del Flujo de Pago E2E.
 * @version 2.1.0 (API Contract Alignment): Se alinea con el contrato de la
 *              API de Stripe para confirmaciones server-side sin redirección.
 * @author L.I.A. Legacy
 */
import Stripe from "stripe";
import chalk from "chalk";
import { createScriptClient } from "../supabase/script-client";
import type { ActionResult } from "@/shared/lib/types/actions.types";

const TEST_AMOUNT_CENTS = 1099; // €10.99

async function testStripeE2EFlow(): Promise<ActionResult<{ orderId: string }>> {
  console.log(
    chalk.cyan.bold(
      "\n[Stripe E2E Test] Iniciando guardián de integridad del flujo de pago v2.1..."
    )
  );

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return {
      success: false,
      error: "La variable de entorno STRIPE_SECRET_KEY no está definida.",
    };
  }

  const stripe = new Stripe(stripeSecretKey);
  const supabase = createScriptClient();

  try {
    // --- PASO 1: Crear una Intención de Pago ---
    console.log(chalk.blue("  Paso 1: Creando PaymentIntent de prueba..."));
    const paymentIntent = await stripe.paymentIntents.create({
      amount: TEST_AMOUNT_CENTS,
      currency: "eur",
      metadata: { testCartId: `cart_${Date.now()}` },
      // --- [INICIO DE REFACTORIZACIÓN DE CONTRATO DE API] ---
      // Se instruye a Stripe para que no permita redirecciones,
      // eliminando la necesidad de una 'return_url' en este contexto de servidor.
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      // --- [FIN DE REFACTORIZACIÓN DE CONTRATO DE API] ---
    });
    console.log(
      chalk.green(`    ✅ PaymentIntent creado: ${paymentIntent.id}`)
    );

    // --- PASO 2: Confirmar el Pago para Disparar el Webhook ---
    console.log(
      chalk.blue("  Paso 2: Confirmando pago para disparar el webhook...")
    );
    const confirmedIntent = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      { payment_method: "pm_card_visa" } // Tarjeta de prueba universal de Stripe
    );
    if (confirmedIntent.status !== "succeeded") {
      throw new Error(
        `La confirmación del pago falló con estado: ${confirmedIntent.status}`
      );
    }
    console.log(
      chalk.green(
        "    ✅ Pago confirmado. Webhook 'payment_intent.succeeded' enviado."
      )
    );

    // --- PASO 3: Esperar y Verificar en la Base de Datos ---
    console.log(
      chalk.blue(
        "  Paso 3: Esperando 5 segundos para el procesamiento del webhook..."
      )
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log(
      chalk.blue("  Paso 4: Verificando la creación de la orden en Supabase...")
    );
    const { data: order, error } = await supabase
      .from("commerce_orders")
      .select("id")
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .single();

    if (error) {
      throw new Error(
        `Error al consultar Supabase: ${error.message}. ¿Llegó el webhook? Revisa la terminal de 'stripe listen'.`
      );
    }
    if (!order) {
      throw new Error(
        "¡FALLO DE VERIFICACIÓN! La orden no fue encontrada en la base de datos."
      );
    }

    console.log(
      chalk.green.bold(
        `\n  [VERIFICACIÓN EXITOSA] Orden encontrada en DB con ID: ${order.id}`
      )
    );
    return { success: true, data: { orderId: order.id } };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error desconocido.";
    console.error(
      chalk.red.bold("\n[Stripe E2E Test] El flujo de prueba falló:"),
      chalk.white(errorMessage)
    );
    return { success: false, error: errorMessage };
  }
}

export default testStripeE2EFlow;
