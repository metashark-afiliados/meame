// RUTA: src/components/features/commerce/StoreClient.tsx
/**
 * @file StoreClient.tsx
 * @description Componente "cerebro" del lado del cliente para la página de la tienda.
 *              Gestiona el estado de los filtros y la lógica de interacción.
 * @version 3.0.0 (Definitive Build Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { Container } from "@/components/ui";
import { ProductFilters } from "@/components/sections/ProductFilters";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { CommunitySection } from "@/components/sections/CommunitySection";
import { useProductFilters } from "@/shared/hooks/use-product-filters";
import type { Product } from "@/shared/lib/schemas/entities/product.schema";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";

interface StoreClientProps {
  initialProducts: Product[];
  content: {
    storePage: Dictionary["storePage"];
    faqAccordion: Dictionary["faqAccordion"];
    communitySection: Dictionary["communitySection"];
  };
  locale: Locale;
}

export function StoreClient({
  initialProducts,
  content,
  locale,
}: StoreClientProps) {
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

  // Guardia de resiliencia para el contenido
  if (!content.storePage) {
    return (
      <Container className="py-16">
        <p>Error: Falta el contenido de la página de la tienda.</p>
      </Container>
    );
  }

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
      {content.faqAccordion && <FaqAccordion content={content.faqAccordion} />}
      {content.communitySection && (
        <CommunitySection content={content.communitySection} />
      )}
    </>
  );
}
