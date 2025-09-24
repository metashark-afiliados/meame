// components/sections/ProductGrid.tsx
/**
 * @file ProductGrid.tsx
 * @description Cuadrícula de productos de lujo para la Tienda v2.0.
 * @version 4.0.0 (Holistic Elite Compliance & SSoT Alignment)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { routes } from "@/shared/lib/navigation";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { cn } from "@/shared/lib/utils/cn";
import { TiltCard } from "@/components/ui/TiltCard";
import { DynamicIcon } from "@/components/ui";
import type { Product } from "@/shared/lib/schemas/entities/product.schema";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

type StorePageContent = NonNullable<Dictionary["storePage"]>;

/**
 * @component StarRating
 * @description Sub-componente atómico para renderizar la calificación de un producto.
 */
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <DynamicIcon
        key={i}
        name="Star"
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating)
            ? "text-yellow-400"
            : "text-muted-foreground/30"
        )}
        fill={i < Math.floor(rating) ? "currentColor" : "none"}
      />
    ))}
  </div>
);

/**
 * @component ProductCard
 * @description Aparato de presentación atómico para una única tarjeta de producto.
 *              Encapsula toda la lógica de UI y MEA/UX.
 */
const ProductCard = ({
  product,
  locale,
  content,
}: {
  product: Product;
  locale: Locale;
  content: StorePageContent;
}) => (
  <TiltCard className="h-full">
    <Link
      href={routes.storeBySlug.path({ locale, slug: product.slug })}
      className="group relative rounded-xl border border-border bg-card shadow-subtle h-full flex flex-col transition-all duration-300 hover:shadow-strong hover:-translate-y-1"
    >
      {product.isBestseller && (
        <div className="absolute top-3 right-3 z-10 bg-accent text-accent-foreground text-xs font-bold uppercase px-2 py-1 rounded-full">
          {content.bestsellerLabel}
        </div>
      )}
      <div className="relative w-full aspect-square overflow-hidden rounded-t-xl">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-contain p-4 transition-transform duration-500 ease-in-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="p-4 flex-grow flex flex-col text-center border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          {product.categorization.primary}
        </p>
        <h3 className="text-md font-bold text-foreground flex-grow">
          {product.name}
        </h3>
        {product.rating && (
          <div className="flex justify-center my-2">
            <StarRating rating={product.rating} />
          </div>
        )}
        <p className="mt-2 text-xl font-semibold text-primary">
          {new Intl.NumberFormat(locale, {
            style: "currency",
            currency: product.currency,
          }).format(product.price)}
        </p>
      </div>
      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
        <DynamicIcon
          name="ShoppingCart"
          className="w-10 h-10 text-white mb-4"
        />
        <span className="text-lg font-bold text-white text-center">
          {content.addToCartButton}
        </span>
      </div>
    </Link>
  </TiltCard>
);

/**
 * @interface ProductGridProps
 * @description Contrato de props para el orquestador de la cuadrícula.
 */
interface ProductGridProps {
  products: Product[];
  locale: Locale;
  content: StorePageContent;
}

/**
 * @component ProductGrid
 * @description Orquestador de la cuadrícula de productos. Aplica la animación
 *              en cascada a sus hijos `ProductCard`.
 */
export function ProductGrid({
  products,
  locale,
  content,
}: ProductGridProps): React.ReactElement {
  logger.info("[ProductGrid v4.0] Renderizando cuadrícula de lujo...");

  const gridVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.main
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-6"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={cardVariants}>
          <ProductCard product={product} locale={locale} content={content} />
        </motion.div>
      ))}
    </motion.main>
  );
}
// components/sections/ProductGrid.tsx
