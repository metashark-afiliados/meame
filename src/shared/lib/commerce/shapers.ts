// RUTA: shared/lib/commerce/shapers.ts
/**
 * @file shapers.ts
 * @description SSoT para las funciones de transformación (shapers) de entidades de comercio.
 *              Estos adaptadores toman datos crudos y los transforman en los contratos
 *              de datos enriquecidos que la aplicación consume.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import { logger } from "@/shared/lib/logging";
import type { Product } from "@/shared/lib/schemas/entities/product.schema";

/**
 * @interface EnrichedProduct
 * @description Extiende la entidad Product con metadatos útiles para la UI, como la ruta.
 */
export interface EnrichedProduct extends Product {
  path: string;
}

/**
 * @function reshapeProduct
 * @description Transforma un objeto Product crudo en un EnrichedProduct.
 */
export function reshapeProduct(product: Product): EnrichedProduct {
  logger.trace(`[Shaper] Remodelando producto: ${product.id}`);
  return {
    ...product,
    path: `/store/${product.slug}`,
  };
}

/**
 * @function reshapeProducts
 * @description Aplica el shaper a un array de productos.
 */
export function reshapeProducts(products: Product[]): EnrichedProduct[] {
  return products.map(reshapeProduct);
}
