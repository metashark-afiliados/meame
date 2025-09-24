// components/forms/CheckoutForm.tsx
/**
 * @file CheckoutForm.tsx
 * @description Componente de cliente de élite que envuelve y gestiona el
 *              Stripe Payment Element para un checkout seguro y con una
 *              experiencia de usuario superior (MEA/UX).
 * @version 2.1.0 (Code Hygiene Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { DotsWave } from "@/components/ui/Loaders/DotsWave";
import { logger } from "@/shared/lib/logging";
// Se elimina la importación no utilizada de 'cn'.

// Se elimina la prop no utilizada 'clientSecret'.
export function CheckoutForm() {
  logger.info("[CheckoutForm] Renderizando v2.1 (Code Hygiene Fix).");
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      logger.warn(
        "[CheckoutForm] Intento de envío de formulario antes de que Stripe.js cargue."
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    logger.trace("[CheckoutForm] Iniciando proceso de confirmación de pago...");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/confirmation`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      logger.error("[CheckoutForm] Error de confirmación de pago de Stripe.", {
        error,
      });
      setErrorMessage(error.message || "Ocurrió un error inesperado.");
    } else {
      logger.error(
        "[CheckoutForm] Un error inesperado ocurrió durante el pago.",
        { error }
      );
      setErrorMessage(
        "Un error inesperado ocurrió. Por favor, intenta de nuevo."
      );
    }

    setIsLoading(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onSubmit={handleSubmit}
    >
      <PaymentElement />

      <Button
        disabled={isLoading || !stripe || !elements}
        className="w-full mt-6"
        size="lg"
      >
        {isLoading && <DotsWave className="mr-2 h-4 w-4" />}
        {isLoading ? "Procesando Pago..." : "Pagar Ahora"}
      </Button>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-destructive text-sm text-center font-semibold mt-4"
        >
          {errorMessage}
        </motion.div>
      )}
    </motion.form>
  );
}
// components/forms/CheckoutForm.tsx
