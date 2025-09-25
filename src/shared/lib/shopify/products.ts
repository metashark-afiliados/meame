// RUTA: src/shared/lib/shopify/products.ts
/**
 * @file products.ts
 * @description SSoT para las consultas de productos de Shopify.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import { shopifyFetch } from "./client";
import { getProductQuery, getProductsQuery } from "./queries/product";
import { reshapeShopifyProducts, reshapeShopifyProduct } from "./shapers";
import type {
  ShopifyProductOperation,
  ShopifyProductsOperation,
} from "./types";
import type { Product } from "@/shared/lib/schemas/entities/product.schema";

export async function getShopifyProducts(): Promise<Product[]> {
  const res = await shopifyFetch<ShopifyProductsOperation>({
    query: getProductsQuery,
  });
  const reshaped = reshapeShopifyProducts(
    res.body.data.products.edges.map((edge) => edge.node)
  );
  return reshaped.filter(
    (product) => product.producerInfo.name === "Global Fitwell"
  );
}

export async function getShopifyProduct(
  handle: string
): Promise<Product | undefined> {
  const res = await shopifyFetch<ShopifyProductOperation>({
    query: getProductQuery,
    variables: { handle },
  });
  return res.body.data.product
    ? reshapeShopifyProduct(res.body.data.product)
    : undefined;
}
