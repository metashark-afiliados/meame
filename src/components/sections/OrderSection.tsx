// components/sections/OrderSection.tsx
/**
 * @file OrderSection.tsx
 * @description Sección dedicada a la conversión.
 * @version 4.0.0 (Prop Contract Sync): Se alinea la forma en que se pasan las
 *              props a OrderForm con su contrato de API actualizado.
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { Container } from "@/components/ui/Container";
import { OrderForm } from "@/components/forms/OrderForm";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { logger } from "@/shared/lib/logging";

interface OrderSectionProps {
  content?: Dictionary["orderSection"];
  locale: string;
}

export function OrderSection({
  content,
  locale,
}: OrderSectionProps): React.ReactElement | null {
  logger.info("[Observabilidad] Renderizando OrderSection v4.0");

  if (!content) {
    logger.warn(
      "[OrderSection] No se proporcionó contenido. La sección no se renderizará."
    );
    return null;
  }

  return (
    <section id="order-form" className="py-16 sm:py-24 bg-secondary/20">
      <Container className="max-w-md">
        <div className="rounded-lg border border-white/20 bg-black/30 p-6 shadow-2xl backdrop-blur-md">
          <PriceDisplay
            originalPrice={content.originalPrice}
            discountedPrice={content.discountedPrice}
            locale={locale}
            originalPriceLabel={content.originalPriceLabel}
            discountedPriceLabel={content.discountedPriceLabel}
          />
          {/* --- [INICIO DE CORRECCIÓN DE CONTRATO] --- */}
          <OrderForm
            content={{
              nameInputLabel: content.nameInputLabel,
              nameInputPlaceholder: content.nameInputPlaceholder,
              phoneInputLabel: content.phoneInputLabel,
              phoneInputPlaceholder: content.phoneInputPlaceholder,
              submitButtonText: content.submitButtonText,
              submitButtonLoadingText: content.submitButtonLoadingText,
            }}
          />
          {/* --- [FIN DE CORRECCIÓN DE CONTRATO] --- */}
        </div>
      </Container>
    </section>
  );
}
// components/sections/OrderSection.tsx
