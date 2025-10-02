// RUTA: src/components/features/commerce/StoreClient.tsx
/**
 * @file StoreClient.tsx
 * @description Componente "cerebro" de cliente para la tienda, ahora con
 *              integridad de contrato restaurada y observabilidad de élite.
 * @version 4.0.0 (Prop Contract Restoration & Elite Compliance)
 * @author L.I.A. Legacy
 */
"use client";

import React, { useMemo } from "react";
import { Container } from "@/components/ui";
import { ProductFilters } from "@/components/sections/ProductFilters";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { CommunitySection } from "@/components/sections/CommunitySection";
import { useProductFilters } from "@/shared/hooks/use-product-filters";
import type { Product } from "@/shared/lib/schemas/entities/product.schema";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";

interface StoreClientProps {
  initialProducts: Product[];
  content: {
    storePage?: Dictionary["storePage"];
    faqAccordion?: Dictionary["faqAccordion"];
    communitySection?: Dictionary["communitySection"];
  };
  locale: Locale;
}

export function StoreClient({
  initialProducts,
  content,
  locale,
}: StoreClientProps) {
  const traceId = useMemo(
    () => logger.startTrace("StoreClient_Lifecycle_v4.0"),
    []
  );
  logger.info("[StoreClient] Renderizando orquestador de cliente v4.0.", {
    traceId,
  });

  const { filters, setFilters, filteredProducts } =
    useProductFilters(initialProducts);

  const allTags = React.useMemo(
    () =>
      Array.from(
        new Set(
          initialProducts.flatMap((p) => [
            p.categorization.primary,
            ...(p.categorization.secondary || []),
          ])
        )
      ),
    [initialProducts]
  );

  // --- [INICIO] GUARDIÁN DE RESILIENCIA DE CONTRATO ---
  if (!content.storePage) {
    const errorMsg =
      "Contrato de UI violado: La propiedad 'content.storePage' es requerida.";
    logger.error(`[Guardián] ${errorMsg}`, { traceId });
    return (
      <Container className="py-16">
        <DeveloperErrorDisplay context="StoreClient" errorMessage={errorMsg} />
      </Container>
    );
  }
  // --- [FIN] GUARDIÁN DE RESILIENCIA DE CONTRATO ---

  return (
    <>
      <Container className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <ProductFilters
            filtersContent={content.storePage.filters}
            allTags={allTags}
            filtersState={filters}
            onFilterChange={setFilters}
          />
          <ProductGrid
            products={filteredProducts}
            locale={locale}
            content={content.storePage}
          />
        </div>
      </Container>

      {/* --- [INICIO DE RESTAURACIÓN DE CONTRATO] --- */}
      {/* Se pasa la prop 'locale' requerida a los componentes de sección */}
      {content.faqAccordion && (
        <FaqAccordion content={content.faqAccordion} locale={locale} />
      )}
      {content.communitySection && (
        <CommunitySection content={content.communitySection} locale={locale} />
      )}
      {/* --- [FIN DE RESTAURACIÓN DE CONTRATO] --- */}
    </>
  );
}
