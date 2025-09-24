// app/[locale]/checkout/page.tsx
/**
 * @file page.tsx
 * @description Página de checkout. Obtiene el client_secret en el servidor
 *              y lo pasa al formulario de Stripe en el cliente.
 * @version 2.0.0 (API Contract Sync)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Container, Skeleton } from "@/components/ui";
import { createCheckoutSessionAction } from "@/shared/lib/commerce/actions/checkout.action.ts";
import { CheckoutForm } from "@/components/forms/CheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientSecret = async () => {
      const result = await createCheckoutSessionAction();
      if (result.success && result.data.clientSecret) {
        setClientSecret(result.data.clientSecret);
      } else {
        // Manejar el error
      }
    };
    fetchClientSecret();
  }, []);

  if (!clientSecret) {
    return (
      <Container className="py-24">
        <Skeleton className="h-96 w-full" />
      </Container>
    );
  }

  return (
    <Container className="py-24 max-w-lg">
      <h1 className="text-3xl font-bold mb-8 text-center">Finalizar Compra</h1>
      <Elements options={{ clientSecret }} stripe={stripePromise}>
        {/* --- [INICIO DE CORRECCIÓN DE CONTRATO] --- */}
        {/* Se elimina la prop 'clientSecret', ya que no forma parte de la API de CheckoutForm */}
        <CheckoutForm />
        {/* --- [FIN DE CORRECCIÓN DE CONTRATO] --- */}
      </Elements>
    </Container>
  );
}
// app/[locale]/checkout/page.tsx

