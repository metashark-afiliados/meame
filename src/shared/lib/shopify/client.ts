// RUTA: src/shared/lib/shopify/client.ts
/**
 * @file client.ts
 * @description SSoT para la comunicación de bajo nivel con la API GraphQL de Shopify.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import { logger } from "@/shared/lib/logging";
import {
  SHOPIFY_GRAPHQL_API_ENDPOINT,
  TAGS,
} from "@/shared/lib/utils/constants";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const endpoint = `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

export async function shopifyFetch<T>({
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
