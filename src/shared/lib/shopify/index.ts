// Ruta correcta: src/shared/lib/shopify/index.ts
/**
 * @file index.ts
 * @description Capa de Acceso a Datos (DAL) de élite para la API de Shopify.
 *              Esta es la SSoT para toda la comunicación de bajo nivel con la
 *              API GraphQL de Shopify. Transforma los datos crudos de la API
 *              a nuestros contratos de datos soberanos.
 * @version 6.0.0 (Architectural Realignment & Elite Compliance)
 * @author razstore (original), RaZ Podestá - MetaShark Tech (adaptación y nivelación)
 */
import "server-only";
import { logger } from "@/shared/lib/logging";
import {
  SHOPIFY_GRAPHQL_API_ENDPOINT,
  TAGS,
} from "@/shared/lib/utils/constants";
import { getProductQuery, getProductsQuery } from "./queries/product";
import { getCartQuery } from "./queries/cart";
import {
  addToCartMutation,
  createCartMutation,
  editCartItemsMutation,
  removeFromCartMutation,
} from "./mutations/cart";
import type {
  ShopifyProduct,
  ShopifyProductOperation,
  ShopifyProductsOperation,
  ShopifyCart,
  ShopifyCartOperation,
  ShopifyCreateCartOperation,
  ShopifyAddToCartOperation,
  ShopifyRemoveFromCartOperation,
  ShopifyUpdateCartOperation,
  Cart,
} from "./types";
import type { Product } from "@/shared/lib/schemas/entities/product.schema";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const endpoint = `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

async function shopifyFetch<T>({
  query,
  variables,
  cache = "force-cache",
}: {
  query: string;
  variables?: ExtractVariables<T>;
  cache?: RequestCache;
}): Promise<{ status: number; body: T }> {
  const traceId = logger.startTrace("shopifyFetch");
  if (!domain || !key || !endpoint) {
    const errorMsg = "Variables de entorno de Shopify no configuradas.";
    logger.error(`[Shopify DAL] ${errorMsg}`, { traceId });
    throw new Error(errorMsg);
  }
  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": key,
      },
      body: JSON.stringify({ query, variables }),
      cache,
      next: { tags: [TAGS.products, TAGS.cart] },
    });

    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }
    logger.traceEvent(traceId, "Fetch a Shopify exitoso.");
    return { status: result.status, body };
  } catch (e) {
    logger.error("[Shopify DAL] Error en shopifyFetch.", { error: e, traceId });
    throw e;
  } finally {
    logger.endTrace(traceId);
  }
}

const removeEdgesAndNodes = <T>(array: { edges: { node: T }[] }): T[] => {
  return array.edges.map((edge) => edge.node);
};

const reshapeCart = (cart: ShopifyCart): Cart => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: "0.0",
      currencyCode: cart.cost.totalAmount.currencyCode,
    };
  }
  return { ...cart, lines: removeEdgesAndNodes(cart.lines) };
};

const reshapeShopifyProduct = (product: ShopifyProduct): Product => {
  const { variants, ...rest } = product;
  return {
    id: rest.id,
    name: rest.title,
    slug: rest.handle,
    price: parseFloat(rest.priceRange.minVariantPrice.amount),
    currency: rest.priceRange.minVariantPrice.currencyCode,
    imageUrl: rest.featuredImage?.url,
    isBestseller: rest.tags.includes("bestseller"),
    inventory: {
      total: 100,
      available: rest.availableForSale ? 100 : 0,
      reserved: 0,
    },
    logistics: { deliveryTime: "3-5 business days" },
    producerInfo: { name: "Global Fitwell", checkoutUrl: "" },
    categorization: {
      primary: product.tags[0] || "General",
      secondary: product.tags.slice(1),
    },
    targetProfile: {},
    rating: undefined,
    options: rest.options,
    variants: removeEdgesAndNodes(variants),
  };
};

const reshapeShopifyProducts = (products: ShopifyProduct[]): Product[] => {
  return products.map(reshapeShopifyProduct);
};

export async function getShopifyProducts(): Promise<Product[]> {
  const res = await shopifyFetch<ShopifyProductsOperation>({
    query: getProductsQuery,
  });
  const reshaped = reshapeShopifyProducts(
    removeEdgesAndNodes(res.body.data.products)
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

export async function createCart(): Promise<Cart> {
  const res = await shopifyFetch<ShopifyCreateCartOperation>({
    query: createCartMutation,
    cache: "no-store",
  });
  return reshapeCart(res.body.data.cartCreate.cart);
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const res = await shopifyFetch<ShopifyAddToCartOperation>({
    query: addToCartMutation,
    variables: { cartId, lines },
    cache: "no-store",
  });
  return reshapeCart(res.body.data.cartLinesAdd.cart);
}

export async function removeFromCart(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  const res = await shopifyFetch<ShopifyRemoveFromCartOperation>({
    query: removeFromCartMutation,
    variables: { cartId, lineIds },
    cache: "no-store",
  });
  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const res = await shopifyFetch<ShopifyUpdateCartOperation>({
    query: editCartItemsMutation,
    variables: { cartId, lines },
    cache: "no-store",
  });
  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}

export async function getShopifyCart(
  cartId: string
): Promise<Cart | undefined> {
  const res = await shopifyFetch<ShopifyCartOperation>({
    query: getCartQuery,
    variables: { cartId },
    cache: "no-store",
  });
  if (!res.body.data.cart) return undefined;
  return reshapeCart(res.body.data.cart);
}
// Ruta correcta: src/shared/lib/shopify/index.ts
