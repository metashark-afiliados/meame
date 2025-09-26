// RUTA: src/app/[locale]/checkout/page.tsx
/**
 * @file page.tsx
 * @description Página de checkout (Server Shell). Obtiene el client_secret y
 *              el contenido i18n y los pasa al cliente.
 * @version 3.1.0 (Holistic Elite Leveling & Resilience Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Container } from "@/components/ui";
import { CheckoutForm } from "@/components/features/commerce/CheckoutForm";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { createCheckoutSessionAction } from "@/shared/lib/actions/commerce/checkout.action";
import { DeveloperErrorDisplay } from "@/components/dev";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default async function CheckoutPage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const [{ dictionary, error: dictError }, checkoutResult] = await Promise.all([
    getDictionary(locale),
    createCheckoutSessionAction(),
  ]);

  const content = dictionary.checkoutForm;

  // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
  if (dictError || !content || !checkoutResult.success) {
    return (
      <DeveloperErrorDisplay
        context="CheckoutPage"
        errorMessage="No se pudo inicializar la sesión de checkout."
        // Se corrige la expresión para evitar pasar 'false'
        errorDetails={
          dictError || (!checkoutResult.success ? checkoutResult.error : null)
        }
      />
    );
  }
  // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---

  const { clientSecret } = checkoutResult.data;

  return (
    <Container className="py-24 max-w-lg">
      <h1 className="text-3xl font-bold mb-8 text-center">{content.title}</h1>
      {/* Se asegura que clientSecret sea string | undefined */}
      <Elements
        options={{ clientSecret: clientSecret ?? undefined }}
        stripe={stripePromise}
      >
        <CheckoutForm content={content} />
      </Elements>
    </Container>
  );
}
