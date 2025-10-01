// RUTA: src/components/sections/ProductInfo.tsx
/**
 * @file ProductInfo.tsx
 * @description Panel de información para detalle de producto, forjado con
 *              seguridad de tipos absoluta, resiliencia y observabilidad de élite.
 * @version 9.0.0 (Holistic Elite Leveling)
 *@author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useMemo, useEffect } from "react";
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
  const traceId = useMemo(
    () => logger.startTrace("ProductInfo_Lifecycle_v9.0"),
    []
  );
  useEffect(() => {
    logger.info(`[ProductInfo] Componente montado para: ${product.name}`, {
      traceId,
    });
    return () => logger.endTrace(traceId);
  }, [product.name, traceId]);

  const searchParams = useSearchParams();

  const {
    description,
    addToCartButton,
    quantityLabel,
    stockStatus,
    shareButton,
  } = content;

  const variants = useMemo(() => product.variants ?? [], [product.variants]);

  const selectedVariant = useMemo(() => {
    if (!variants || variants.length === 0) return undefined;
    return variants.find((variant) =>
      variant.selectedOptions.every(
        (option) => searchParams.get(option.name.toLowerCase()) === option.value
      )
    );
  }, [variants, searchParams]);

  const stockAvailable = selectedVariant
    ? selectedVariant.availableForSale
    : product.inventory.available > 0;
  const selectedVariantId = selectedVariant?.id;

  // --- [INICIO DE REFACTORIZACIÓN DE LÓGICA RESILIENTE] ---
  const shareText = useMemo(() => {
    // Extrae y une el texto de todos los bloques de tipo 'p' para un resumen robusto.
    return (
      description
        .filter((block) => block.type === "p")
        .map((block) => block.text)
        .join(" ")
        .slice(0, 150) + "..."
    ); // Trunca para compatibilidad con redes sociales
  }, [description]);
  // --- [FIN DE REFACTORIZACIÓN DE LÓGICA RESILIENTE] ---

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {product.categorization.primary}
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
            {product.name}
          </h1>
          <div className="flex items-center gap-4 mt-4">
            {product.rating && <StarRating rating={product.rating} />}
            <span className="text-3xl font-bold text-primary">
              {new Intl.NumberFormat("it-IT", {
                style: "currency",
                currency: product.currency,
              }).format(product.price)}
            </span>
          </div>
        </div>
        <ShareButton
          shareData={{
            title: product.name,
            text: shareText, // <-- Se utiliza el texto extraído de forma segura
            url: absoluteUrl,
          }}
          content={shareButton}
        />
      </div>

      <TextSection
        content={description} // <-- Ahora el tipo es correcto
        spacing="compact"
        prose={true}
        className="py-0 text-muted-foreground"
      />

      <Separator />

      <VariantSelectorProvider
        options={product.options ?? []}
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
              String(product.inventory.available)
            )}
          </p>
        ) : (
          <p className="text-destructive">{stockStatus.unavailable}</p>
        )}
      </div>
    </div>
  );
}
