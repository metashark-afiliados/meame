// RUTA: src/app/[locale]/checkout/page.tsx
/**
 * @file page.tsx
 * @description Página de checkout (Server Shell). Actúa como un Guardián de
 *              Contratos, garantizando la integridad de todos los datos
 *              antes de renderizar el componente de cliente.
 * @version 4.0.0 (Holistic Contract Guardian)
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
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { CheckoutFormContentSchema } from "@/shared/lib/schemas/components/commerce/checkout-form.schema";

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

  // --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: GUARDIÁN DE CONTRATO ZOD] ---
  const contentValidation = CheckoutFormContentSchema.safeParse(
    dictionary.checkoutForm
  );

  if (dictError || !contentValidation.success || !checkoutResult.success) {
    return (
      <DeveloperErrorDisplay
        context="CheckoutPage"
        errorMessage="No se pudo inicializar la sesión de checkout."
        errorDetails={
          dictError ||
          (!contentValidation.success ? contentValidation.error : null) ||
          (!checkoutResult.success ? checkoutResult.error : null)
        }
      />
    );
  }

  // A partir de aquí, 'content' y 'checkoutResult.data' son 100% seguros a nivel de tipos.
  const content = contentValidation.data;
  const { clientSecret } = checkoutResult.data;
  // --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

  return (
    <Container className="py-24 max-w-lg">
      <h1 className="text-3xl font-bold mb-8 text-center">{content.title}</h1>
      <Elements
        options={{ clientSecret: clientSecret ?? undefined }}
        stripe={stripePromise}
      >
        <CheckoutForm content={content} />
      </Elements>
    </Container>
  );
}
