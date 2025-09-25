// RUTA: src/components/sections/ProductInfo.tsx
/**
 * @file ProductInfo.tsx
 * @description Panel de información para detalle de producto con capacidad de compartir.
 * @version 7.1.0 (Component API Contract Fix): Corrige la forma en que se pasan
 *              las props al componente hijo `TextSection`, resolviendo errores
 *              críticos de tipo TS2339.
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { DynamicIcon, Separator } from "@/components/ui";
import { TextSection } from "@/components/sections/TextSection";
import { VariantSelectorProvider } from "@/components/features/product-variant-selector/VariantSelectorProvider";
import { VariantSelector } from "@/components/features/product-variant-selector/VariantSelector";
import { AddToCartForm } from "@/components/features/commerce/AddToCartForm";
import { ShareButton } from "@/components/ui/ShareButton";
import type { z } from "zod";
import type { ProductDetailPageContentSchema } from "@/shared/lib/schemas/pages/product-detail-page.schema";
import type { Product } from "@/shared/lib/schemas/entities/product.schema";
import { cn } from "@/shared/lib/utils/cn";
import { logger } from "@/shared/lib/logging";

type ProductPageContent = z.infer<typeof ProductDetailPageContentSchema>;

interface ProductInfoProps {
  product: Product;
  content: ProductPageContent;
  absoluteUrl: string;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <DynamicIcon
        key={i}
        name="Star"
        className={cn(
          "h-5 w-5",
          i < Math.floor(rating)
            ? "text-yellow-400"
            : "text-muted-foreground/30"
        )}
        fill={i < Math.floor(rating) ? "currentColor" : "none"}
      />
    ))}
  </div>
);

export function ProductInfo({
  product,
  content,
  absoluteUrl,
}: ProductInfoProps) {
  logger.info(`[ProductInfo] Renderizando v7.1 para producto: ${product.name}`);
  const searchParams = useSearchParams();

  const {
    description,
    addToCartButton,
    quantityLabel,
    stockStatus,
    shareButton,
  } = content;

  const productData = product;

  const variants = React.useMemo(
    () => productData.variants ?? [],
    [productData.variants]
  );

  const selectedVariant = React.useMemo(() => {
    if (!variants || variants.length === 0) return undefined;
    return variants.find((variant) =>
      variant.selectedOptions.every(
        (option) => searchParams.get(option.name.toLowerCase()) === option.value
      )
    );
  }, [variants, searchParams]);

  const stockAvailable = selectedVariant
    ? selectedVariant.availableForSale
    : productData.inventory.available > 0;

  const selectedVariantId = selectedVariant?.id;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {productData.categorization.primary}
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
            {productData.name}
          </h1>
          <div className="flex items-center gap-4 mt-4">
            {productData.rating && <StarRating rating={productData.rating} />}
            <span className="text-3xl font-bold text-primary">
              {new Intl.NumberFormat("it-IT", {
                style: "currency",
                currency: productData.currency,
              }).format(productData.price)}
            </span>
          </div>
        </div>
        <ShareButton
          shareData={{
            title: productData.name,
            text: description[0]?.text || productData.name, // <-- CORRECCIÓN
            url: absoluteUrl,
          }}
          content={shareButton}
        />
      </div>

      <TextSection
        content={description} // <-- CORRECCIÓN: Se pasa el array directamente.
        spacing="compact"
        prose={true}
        className="py-0 text-muted-foreground"
      />

      <Separator />

      <VariantSelectorProvider
        options={productData.options ?? []}
        variants={variants}
      >
        <VariantSelector />
      </VariantSelectorProvider>

      <AddToCartForm
        isAvailable={stockAvailable}
        variantId={selectedVariantId}
        content={{
          addToCartButton: addToCartButton,
          quantityLabel: quantityLabel,
          outOfStockText: stockStatus.unavailable,
        }}
      />

      <div className="text-sm text-center">
        {stockAvailable ? (
          <p className="text-green-600">
            {stockStatus.available.replace(
              "{{count}}",
              String(productData.inventory.available)
            )}
          </p>
        ) : (
          <p className="text-destructive">{stockStatus.unavailable}</p>
        )}
      </div>
    </div>
  );
}
