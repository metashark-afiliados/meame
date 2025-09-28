// RUTA: src/shared/lib/actions/shopify/getAdminProducts.action.ts
/**
 * @file getAdminProducts.action.ts
 * @description Server Action para obtener una lista de productos de la Admin API de Shopify.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { createServerClient } from "@/shared/lib/supabase/server";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { shopifyAdminFetch } from "@/shared/lib/shopify/admin-client";
import { getAdminProductsQuery } from "@/shared/lib/shopify/queries/admin-product";
import type {
  ShopifyAdminProductsOperation,
  ShopifyAdminProduct,
} from "@/shared/lib/shopify/types/admin.types";
import { z } from "zod";

// Schema para la respuesta mapeada (camelCase y simplificada)
const AdminProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  status: z.string(),
  price: z.string(),
  currency: z.string(),
  inventoryQuantity: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AdminProduct = z.infer<typeof AdminProductSchema>;

interface GetAdminProductsInput {
  first?: number;
  after?: string;
}

export async function getAdminProductsAction(
  input: GetAdminProductsInput = {}
): Promise<ActionResult<{ products: AdminProduct[]; hasNextPage: boolean; endCursor: string | null }>> {
  const traceId = logger.startTrace("getAdminProductsAction_v1.0");
  logger.info("[Shopify Admin Action] Solicitando productos de la Admin API...", { input, traceId });

  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Implementar autorización: solo usuarios autenticados pueden usar esta acción.
  // En un entorno real, se podría verificar si el usuario tiene un rol de "admin" o similar.
  if (!user) {
    logger.warn("[Shopify Admin Action] Intento no autorizado.", { traceId });
    return { success: false, error: "auth_required" };
  }

  try {
    const { first = 10, after } = input;

    const res = await shopifyAdminFetch<ShopifyAdminProductsOperation>({
      query: getAdminProductsQuery,
      variables: { first, after },
      cache: "no-store", // Datos de Admin API suelen requerir ser frescos
    });

    if (res.body.errors) {
      throw new Error(res.body.errors.map(err => err.message).join(", "));
    }

    const productsData = res.body.data?.products?.edges.map(edge => edge.node) || [];
    const pageInfo = res.body.data?.products?.pageInfo;

    const mappedProducts: AdminProduct[] = productsData.map((p: ShopifyAdminProduct) => {
      // Tomamos la primera variante para el precio e inventario si existe
      const firstVariant = p.variants.edges[0]?.node;
      return {
        id: p.id,
        title: p.title,
        handle: p.handle,
        status: p.status,
        price: firstVariant?.price.amount || "0.00",
        currency: firstVariant?.price.currencyCode || "USD",
        inventoryQuantity: firstVariant?.inventoryQuantity || 0,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    const validation = z.array(AdminProductSchema).safeParse(mappedProducts);
    if (!validation.success) {
      logger.error("[Shopify Admin Action] Los datos de productos de la Admin API son inválidos según el esquema.", {
        errors: validation.error.flatten(),
        traceId,
      });
      throw new Error("Formato de datos de productos inesperado desde la Admin API.");
    }

    logger.success(`[Shopify Admin Action] ${validation.data.length} productos obtenidos de la Admin API.`, { traceId });
    return {
      success: true,
      data: {
        products: validation.data,
        hasNextPage: pageInfo?.hasNextPage || false,
        endCursor: pageInfo?.endCursor || null,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[Shopify Admin Action] Fallo crítico al obtener productos de la Admin API.", {
      error: errorMessage,
      traceId,
    });
    return { success: false, error: `Error al cargar productos de Shopify Admin: ${errorMessage}` };
  } finally {
    logger.endTrace(traceId);
  }
}
