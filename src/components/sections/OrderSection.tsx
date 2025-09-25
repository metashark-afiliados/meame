// RUTA: src/components/sections/OrderSection.tsx
/**
 * @file OrderSection.tsx
 * @description Sección dedicada a la conversión, ahora con MEA/UX y arquitectura soberana.
 * @version 7.0.0 (Holistic Elite Leveling & MEA/UX Injection)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { Container } from "@/components/ui/Container";
// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
// Se corrige la ruta de importación para apuntar a la SSoT soberana.
import { OrderForm } from "@/components/forms/OrderForm";
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { logger } from "@/shared/lib/logging";

// --- SSoT de Tipos y Animaciones ---
interface OrderSectionProps {
  content?: Dictionary["orderSection"];
  locale: string;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// --- Componente de Élite ---
export function OrderSection({
  content,
  locale,
}: OrderSectionProps): React.ReactElement | null {
  logger.info("[OrderSection] Renderizando v7.0 (Elite & MEA/UX).");

  // --- Guardia de Resiliencia (Pilar VI) ---
  if (!content) {
    logger.warn(
      "[OrderSection] No se proporcionó contenido. No se renderizará."
    );
    return null;
  }

  return (
    <motion.section
      id="order-form"
      className="py-16 sm:py-24 bg-secondary/20"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <Container className="max-w-md">
        <div className="rounded-lg border border-white/20 bg-black/30 p-6 shadow-2xl backdrop-blur-md">
          <PriceDisplay
            originalPrice={content.originalPrice}
            discountedPrice={content.discountedPrice}
            locale={locale}
            originalPriceLabel={content.originalPriceLabel}
            discountedPriceLabel={content.discountedPriceLabel}
          />
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
        </div>
      </Container>
    </motion.section>
  );
}
// RUTA: src/components/sections/OrderSection.tsx
