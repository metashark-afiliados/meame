// Ruta correcta: src/shared/lib/commerce/index.ts
/**
 * @file index.ts (Barrel File)
 * @description Capa de Acceso a Datos Soberana y Agregadora para E-commerce.
 * @version 4.0.0 (Production Resilience & Architectural Realignment):
 *              Implementa un patrón de obtención de datos híbrido y resiliente.
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

async function getLocalProducts(locale: Locale): Promise<Product[]> {
  const traceId = logger.startTrace("getLocalProducts");
  try {
    const catalogData = await loadJsonAsset<ProductCatalogI18n>(
      "campaigns",
      "products/catalog.i18n.json"
    );
    const catalogForLocale = catalogData[locale];
    if (!catalogForLocale) return [];

    const validation = ProductCatalogSchema.safeParse(catalogForLocale);
    if (!validation.success) {
      logger.error(
        "[Commerce Layer] Catálogo local de productos falló la validación.",
        { error: validation.error.flatten(), traceId }
      );
      return [];
    }
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
    return [];
  } finally {
    logger.endTrace(traceId);
  }
}

export async function getProducts(options: {
  locale: Locale;
}): Promise<EnrichedProduct[]> {
  const traceId = logger.startTrace("getProducts (Hybrid v4.0)");
  logger.info(
    `[Commerce Layer] Solicitando productos HÍBRIDOS para [${options.locale}]`
  );

  try {
    const [shopifyProducts, localProducts] = await Promise.all([
      getShopifyProducts().catch((e: unknown) => {
        logger.error(
          "[Commerce Layer] Fallo al obtener productos de Shopify. Degradando elegantemente.",
          { error: e, traceId }
        );
        return [];
      }),
      getLocalProducts(options.locale),
    ]);

    logger.traceEvent(
      traceId,
      `Shopify: ${shopifyProducts.length}, Local: ${localProducts.length}`
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

export async function getProductBySlug(options: {
  locale: Locale;
  slug: string;
}): Promise<EnrichedProduct | null> {
  const traceId = logger.startTrace(`getProductBySlug:${options.slug}`);
  logger.info(
    `[Commerce Layer] Solicitando producto HÍBRIDO por slug: "${options.slug}"`
  );

  try {
    const shopifyProduct = await getShopifyProduct(options.slug).catch(
      () => null
    );
    if (shopifyProduct) {
      logger.traceEvent(traceId, "Producto encontrado en Shopify.");
      return reshapeProduct(shopifyProduct);
    }
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
      `[Commerce Layer] Producto con slug "${options.slug}" no fue encontrado en ninguna fuente de datos.`,
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
// Ruta correcta: src/shared/lib/commerce/index.ts
