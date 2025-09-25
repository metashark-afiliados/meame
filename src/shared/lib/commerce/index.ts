// RUTA: src/shared/lib/commerce/index.ts
/**
 * @file index.ts (Barrel File)
 * @description Capa de Acceso a Datos Soberana y Agregadora para E-commerce.
 * @version 5.0.0 (Production Resilience & Holistic Refactor)
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import { logger } from "@/shared/lib/logging";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import {
  reshapeProducts,
  reshapeProduct,
  type EnrichedProduct,
} from "./shapers";
import { getShopifyProducts, getShopifyProduct } from "@/shared/lib/shopify";
import { loadJsonAsset } from "@/shared/lib/i18n/campaign.data.loader";
import {
  ProductCatalogSchema,
  type Product,
} from "@/shared/lib/schemas/entities/product.schema";
import type { z } from "zod";

type ProductCatalogI18n = Partial<
  Record<Locale, z.infer<typeof ProductCatalogSchema>>
>;

/**
 * @function getLocalProducts
 * @description Obtiene y valida los productos de dropshipping/afiliado desde el catálogo JSON local.
 * @private
 * @param {Locale} locale - El idioma para el cual obtener los datos.
 * @returns {Promise<Product[]>} Una lista de productos locales.
 */
async function getLocalProducts(locale: Locale): Promise<Product[]> {
  const traceId = logger.startTrace("getLocalProducts");
  try {
    const catalogData = await loadJsonAsset<ProductCatalogI18n>(
      "products",
      "catalog.i18n.json"
    );
    const catalogForLocale = catalogData[locale];
    if (!catalogForLocale) return [];

    const validation = ProductCatalogSchema.safeParse(catalogForLocale);
    if (!validation.success) {
      logger.error(
        "[Commerce DAL] Catálogo local de productos falló la validación.",
        { error: validation.error.flatten(), traceId }
      );
      return [];
    }
    // Filtra para devolver solo productos que NO son de nuestra marca principal.
    const localProducts = validation.data.products.filter(
      (p) => p.producerInfo.name !== "Global Fitwell"
    );
    logger.traceEvent(
      traceId,
      `Se encontraron ${localProducts.length} productos locales.`
    );
    return localProducts;
  } catch (error) {
    logger.error("Fallo crítico al cargar el catálogo de productos locales.", {
      error,
      traceId,
    });
    return []; // Devuelve un array vacío en caso de error.
  } finally {
    logger.endTrace(traceId);
  }
}

/**
 * @function getProducts
 * @description API pública para obtener TODOS los productos. Agrega datos de Shopify
 *              y del catálogo local de forma concurrente y resiliente.
 * @param {{ locale: Locale }} options - Opciones que incluyen el locale.
 * @returns {Promise<EnrichedProduct[]>} Una lista de productos enriquecidos y listos para la UI.
 */
export async function getProducts(options: {
  locale: Locale;
}): Promise<EnrichedProduct[]> {
  const traceId = logger.startTrace("getProducts (Hybrid v5.0)");
  logger.info(
    `[Commerce DAL] Solicitando productos HÍBRIDOS para [${options.locale}]`
  );

  try {
    const [shopifyResult, localResult] = await Promise.allSettled([
      getShopifyProducts(),
      getLocalProducts(options.locale),
    ]);

    const shopifyProducts =
      shopifyResult.status === "fulfilled" ? shopifyResult.value : [];
    const localProducts =
      localResult.status === "fulfilled" ? localResult.value : [];

    if (shopifyResult.status === "rejected") {
      logger.error(
        "[Commerce DAL] Fallo al obtener productos de Shopify. Degradando elegantemente.",
        { error: shopifyResult.reason, traceId }
      );
    }

    logger.traceEvent(
      traceId,
      `Resultados de fuentes: Shopify: ${shopifyProducts.length}, Local: ${localProducts.length}`
    );

    const allProducts = [...shopifyProducts, ...localProducts];
    return reshapeProducts(allProducts);
  } catch (error) {
    logger.error("Error inesperado en getProducts.", { error, traceId });
    return [];
  } finally {
    logger.endTrace(traceId);
  }
}

/**
 * @function getProductBySlug
 * @description API pública para obtener un único producto por su slug desde cualquier fuente.
 * @param {{ locale: Locale; slug: string }} options - Opciones de búsqueda.
 * @returns {Promise<EnrichedProduct | null>} El producto encontrado o null.
 */
export async function getProductBySlug(options: {
  locale: Locale;
  slug: string;
}): Promise<EnrichedProduct | null> {
  const traceId = logger.startTrace(`getProductBySlug:${options.slug}`);
  logger.info(
    `[Commerce DAL] Solicitando producto HÍBRIDO por slug: "${options.slug}"`
  );

  try {
    // Primero intenta buscar en Shopify de forma resiliente.
    const shopifyProduct = await getShopifyProduct(options.slug).catch(
      () => null
    );
    if (shopifyProduct) {
      logger.traceEvent(traceId, "Producto encontrado en Shopify.");
      return reshapeProduct(shopifyProduct);
    }

    // Si no se encuentra en Shopify, busca en el catálogo local.
    logger.traceEvent(
      traceId,
      "Producto no encontrado en Shopify. Buscando en catálogo local..."
    );
    const localProducts = await getLocalProducts(options.locale);
    const localProduct = localProducts.find((p) => p.slug === options.slug);

    if (localProduct) {
      logger.traceEvent(traceId, "Producto encontrado en catálogo local.");
      return reshapeProduct(localProduct);
    }

    logger.warn(
      `[Commerce DAL] Producto con slug "${options.slug}" no fue encontrado en ninguna fuente de datos.`,
      { traceId }
    );
    return null;
  } catch (error) {
    logger.error("Error inesperado en getProductBySlug.", { error, traceId });
    return null;
  } finally {
    logger.endTrace(traceId);
  }
}
