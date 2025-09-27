// RUTA: src/components/sections/ProductGrid.tsx
/**
 * @file ProductGrid.tsx
 * @description Cuadrícula de productos de lujo, ahora un orquestador puro.
 * @version 5.0.0 (Atomic Refactor)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { ProductCard } from "@/components/ui/ProductCard"; // <-- Importación soberana
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import type { Product } from "@/shared/lib/schemas/entities/product.schema";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

type StorePageContent = NonNullable<Dictionary["storePage"]>;

interface ProductGridProps {
  products: Product[];
  locale: Locale;
  content: StorePageContent;
}

export function ProductGrid({
  products,
  locale,
  content,
}: ProductGridProps): React.ReactElement {
  logger.info("[ProductGrid v5.0] Renderizando orquestador atómico...");

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
