// RUTA: src/shared/lib/actions/shopify/getAdminProducts.action.ts
/**
 * @file getAdminProducts.action.ts
 * @description Server Action soberana y de producción para obtener una lista de
 *              productos desde la Admin API de Shopify. Este aparato actúa como
 *              un guardián de seguridad y un transformador de datos, asegurando
 *              que solo los usuarios autorizados puedan acceder a los datos y que
 *              la información devuelta a la aplicación cumpla con un contrato
 *              de datos estricto y desacoplado.
 * @version 2.0.0 (Production-Ready & Holistically Aligned)
 * @author L.I.A. Legacy - Asistente de Refactorización de Élite
 */
"use server";

import { z } from "zod";
import { createServerClient } from "@/shared/lib/supabase/server";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { shopifyAdminFetch } from "@/shared/lib/shopify/admin-client";
import { getAdminProductsQuery } from "@/shared/lib/shopify/queries/admin-product";
import type {
  ShopifyAdminProductsOperation,
  ShopifyAdminProduct,
} from "@/shared/lib/shopify/types/admin.types";

// --- SSoT del Contrato de Datos de Salida ---
// Este es el schema que define la forma de los datos que esta acción devuelve.
// Actúa como una capa de anticorrupción, desacoplando nuestra aplicación de la
// estructura de datos compleja y anidada de la API de Shopify.
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

// --- Contrato de Datos de Entrada ---
interface GetAdminProductsInput {
  first?: number;
  after?: string;
}

/**
 * @function getAdminProductsAction
 * @description Orquesta la obtención, transformación y validación de productos
 *              desde la Admin API de Shopify.
 * @param {GetAdminProductsInput} input - Parámetros para la paginación.
 * @returns {Promise<ActionResult<{ products: AdminProduct[]; hasNextPage: boolean; endCursor: string | null }>>}
 *          El resultado de la operación, conteniendo los productos transformados o un error.
 */
export async function getAdminProductsAction(
  input: GetAdminProductsInput = {}
): Promise<
  ActionResult<{
    products: AdminProduct[];
    hasNextPage: boolean;
    endCursor: string | null;
  }>
> {
  const traceId = logger.startTrace("getAdminProductsAction_v2.0");
  logger.info(
    "[Shopify Admin Action] Solicitando productos de la Admin API...",
    { input, traceId }
  );

  // --- Pilar de Seguridad: Autenticación y Autorización ---
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logger.warn("[Shopify Admin Action] Intento de acceso no autorizado.", {
      traceId,
    });
    return { success: false, error: "auth_required" };
  }

  // --- Pilar de Resiliencia: Manejo de Errores Holístico ---
  try {
    const { first = 10, after } = input;

    // 1. Capa de Acceso a Datos: Interactuar con el servicio externo.
    // La función `shopifyAdminFetch` ya contiene la lógica para manejar errores de red y de GraphQL.
    // Si la API de Shopify devuelve un array `errors`, `shopifyAdminFetch` lanzará una excepción,
    // que será capturada por este bloque `catch`.
    const response = await shopifyAdminFetch<ShopifyAdminProductsOperation>({
      query: getAdminProductsQuery,
      variables: { first, after },
      cache: "no-store",
    });

    const productsData =
      response.body.data?.products?.edges.map((edge) => edge.node) || [];
    const pageInfo = response.body.data?.products?.pageInfo;

    // 2. Capa de Transformación (Shaping): Mapear datos crudos al contrato interno.
    const mappedProducts: AdminProduct[] = productsData.map(
      (shopifyProduct: ShopifyAdminProduct) => {
        const firstVariant = shopifyProduct.variants.edges[0]?.node;
        return {
          id: shopifyProduct.id,
          title: shopifyProduct.title,
          handle: shopifyProduct.handle,
          status: shopifyProduct.status,
          price: firstVariant?.price.amount || "0.00",
          currency: firstVariant?.price.currencyCode || "USD",
          inventoryQuantity: firstVariant?.inventoryQuantity || 0,
          createdAt: shopifyProduct.createdAt,
          updatedAt: shopifyProduct.updatedAt,
        };
      }
    );

    // 3. Capa de Validación: Asegurar la integridad de los datos transformados.
    const validation = z.array(AdminProductSchema).safeParse(mappedProducts);
    if (!validation.success) {
      logger.error(
        "[Shopify Admin Action] Los datos transformados son inválidos según el schema.",
        {
          errors: validation.error.flatten(),
          traceId,
        }
      );
      throw new Error(
        "Formato de datos de productos inesperado tras la transformación."
      );
    }

    logger.success(
      `[Shopify Admin Action] ${validation.data.length} productos obtenidos y validados.`,
      { traceId }
    );
    return {
      success: true,
      data: {
        products: validation.data,
        hasNextPage: pageInfo?.hasNextPage || false,
        endCursor: pageInfo?.endCursor || null,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "[Shopify Admin Action] Fallo crítico al obtener productos de la Admin API.",
      {
        error: errorMessage,
        traceId,
      }
    );
    return {
      success: false,
      error: `Error al cargar productos de Shopify Admin: ${errorMessage}`,
    };
  } finally {
    logger.endTrace(traceId);
  }
}
