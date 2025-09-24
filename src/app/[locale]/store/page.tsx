// app/[locale]/store/page.tsx
/**
 * @file page.tsx
 * @description Página de la Tienda, ahora como un Client Component interactivo.
 * @version 6.0.0 (Interactive Filtering)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useEffect } from "react";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { Container, Skeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductFilters } from "@/components/sections/ProductFilters";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { CommunitySection } from "@/components/sections/CommunitySection";
import { useProductFilters } import type { ProductFiltersState } from "@/shared/hooks/use-product-filters";import type { Product } from "@/shared/lib/schemas/entities/product.schema";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { getProducts } from "@/shared/lib/commerce";

interface StorePageProps {
  params: { locale: Locale };
}

export default function StorePage({ params: { locale } }: StorePageProps) {
  logger.info(
    `[StorePage] Renderizando v6.0 (Interactive) para locale: ${locale}`
  );

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [content, setContent] = useState<Dictionary["storePage"] | null>(null);
  const [faqContent, setFaqContent] = useState<
    Dictionary["faqAccordion"] | null
  >(null);
  const [communityContent, setCommunityContent] = useState<
    Dictionary["communitySection"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hook de lógica de filtrado
  const { filters, setFilters, filteredProducts } =
    useProductFilters(allProducts);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [{ dictionary }, products] = await Promise.all([
        getDictionary(locale),
        getProducts({ locale }),
      ]);

      setAllProducts(products);
      setContent(dictionary.storePage);
      setFaqContent(dictionary.faqAccordion);
      setCommunityContent(dictionary.communitySection);
      setIsLoading(false);
    };
    fetchData();
  }, [locale]);

  if (isLoading || !content) {
    return (
      <>
        <PageHeader
          content={{
            title: "Nuestra Tienda",
            subtitle: "Cargando productos...",
          }}
        />
        <Container className="py-16 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Skeleton className="lg:col-span-1 h-[500px]" />
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </Container>
      </>
    );
  }

  const allTags = Array.from(
    new Set(
      allProducts.flatMap((p) => [
        p.categorization.primary,
        ...(p.categorization.secondary || []),
      ])
    )
  );

  return (
    <>
      <PageHeader content={content} />
      <Container className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <ProductFilters
            filtersContent={content.filters}
            allTags={allTags}
            filtersState={filters}
            onFilterChange={setFilters}
          />
          <ProductGrid
            products={filteredProducts}
            locale={locale}
            content={content}
          />
        </div>
      </Container>
      {faqContent && <FaqAccordion content={faqContent} />}
      {communityContent && <CommunitySection content={communityContent} />}
    </>
  );
}
// app/[locale]/store/page.tsx
