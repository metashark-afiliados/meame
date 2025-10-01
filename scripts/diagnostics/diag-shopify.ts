// RUTA: scripts/diagnostics/diag-shopify.ts
/**
 * @file diag-shopify.ts
 * @description Herramienta de diagnóstico de élite, holística y lista para producción para Shopify.
 *              v3.1.0 (Elite Code Hygiene): Se elimina la interfaz 'ShopifyResponse' no utilizada
 *              para cumplir con los estándares de limpieza de código y resolver el error de linting.
 * @version 3.1.0
 *@author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import chalk from "chalk";
import { loadEnvironment } from "./_utils";
import { logger } from "../../src/shared/lib/logging";
import * as fs from "fs/promises";
import * as path from "path";
import { getAdminProductsAction } from "@/shared/lib/actions/shopify";
import type { AdminProduct } from "@/shared/lib/shopify/admin.shapers";

// --- Contratos de Tipo Soberanos ---

interface ShopifyError {
  message: string;
  [key: string]: unknown;
}

// --- [INICIO DE REFACTORIZACIÓN DE HIGIENE] ---
// La interfaz 'ShopifyResponse' no utilizada ha sido eliminada.
// --- [FIN DE REFACTORIZACIÓN DE HIGIENE] ---

interface ShopifyDiagnosticReport {
  generatedAt: string;
  connection_status: {
    admin_api?: "OK" | "FAILED" | "SKIPPED";
    storefront_api?: "OK" | "FAILED" | "SKIPPED";
  };
  shop_name?: string;
  admin_api_info: {
    products_sample?: AdminProduct[];
  };
  errors: string[];
}

// --- Motor de Peticiones GraphQL ---
async function shopifyGraphQLRequest<T>(
  url: string,
  accessToken: string,
  query: string,
  apiVersion: string,
  isStorefront: boolean = false
): Promise<{ status: number; body: T }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Shopify-Api-Version": apiVersion,
  };

  if (isStorefront) {
    headers["X-Shopify-Storefront-Access-Token"] = accessToken;
  } else {
    headers["X-Shopify-Access-Token"] = accessToken;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
    });
    const json = await response.json();
    if (json.errors) {
      throw new Error(
        json.errors.map((e: ShopifyError) => e.message).join("\n")
      );
    }
    return { status: response.status, body: json as T };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    logger.error(`[Shopify API Fetch] Fallo en la petición a ${url}`, {
      error: errorMessage,
    });
    throw e;
  }
}

// --- Script de Diagnóstico Principal ---
async function runShopifyDiagnostics() {
  const traceId = logger.startTrace("runShopifyDiagnostics_v3.1");
  logger.startGroup("🛍️  Iniciando Diagnóstico Integral de Shopify (v3.1)...");

  const fullReport: ShopifyDiagnosticReport = {
    generatedAt: new Date().toISOString(),
    connection_status: {},
    admin_api_info: {},
    errors: [],
  };

  try {
    loadEnvironment([
      "SHOPIFY_STORE_DOMAIN",
      "SHOPIFY_STOREFRONT_ACCESS_TOKEN",
      "SHOPIFY_ADMIN_ACCESS_TOKEN",
      "SHOPIFY_API_VERSION",
    ]);
    logger.traceEvent(traceId, "Variables de entorno validadas.");

    const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
    const STOREFRONT_ACCESS_TOKEN =
      process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
    const ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;
    const API_VERSION = process.env.SHOPIFY_API_VERSION!;

    const ADMIN_URL = `https://${SHOP_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;
    const STOREFRONT_URL = `https://${SHOP_DOMAIN}/api/${API_VERSION}/graphql.json`;

    logger.info(chalk.blueBright("\n--- Probando Conexión a Admin API ---"), {
      traceId,
    });
    try {
      const adminResponse = await shopifyGraphQLRequest<{
        data: { shop: { name: string } };
      }>(ADMIN_URL, ADMIN_ACCESS_TOKEN, `{ shop { name } }`, API_VERSION);
      fullReport.shop_name = adminResponse.body.data.shop.name;
      fullReport.connection_status.admin_api = "OK";
      logger.success(
        chalk.green(
          `  ✅ Conexión a Admin API exitosa. Tienda: ${fullReport.shop_name}`
        ),
        { traceId }
      );
    } catch (error) {
      const errorMsg = `Fallo al conectar con Admin API: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(chalk.red(`  ❌ ${errorMsg}`), { traceId });
      fullReport.errors.push(errorMsg);
      fullReport.connection_status.admin_api = "FAILED";
    }

    logger.info(
      chalk.blueBright("\n--- Probando Conexión a Storefront API ---"),
      { traceId }
    );
    try {
      await shopifyGraphQLRequest(
        STOREFRONT_URL,
        STOREFRONT_ACCESS_TOKEN,
        `{ shop { name } }`,
        API_VERSION,
        true
      );
      fullReport.connection_status.storefront_api = "OK";
      logger.success(chalk.green("  ✅ Conexión a Storefront API exitosa."), {
        traceId,
      });
    } catch (error) {
      const errorMsg = `Fallo al conectar con Storefront API: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(chalk.red(`  ❌ ${errorMsg}`), { traceId });
      fullReport.errors.push(errorMsg);
      fullReport.connection_status.storefront_api = "FAILED";
    }

    if (fullReport.connection_status.admin_api === "OK") {
      logger.info(
        chalk.blueBright(
          "\n--- Obteniendo Muestra de Productos (Admin API) ---"
        ),
        { traceId }
      );
      const productsResult = await getAdminProductsAction({ first: 3 });

      if (productsResult.success) {
        fullReport.admin_api_info.products_sample =
          productsResult.data.products;
        logger.success(
          chalk.green(
            `  ✅ Se obtuvieron ${productsResult.data.products.length} productos de muestra.`
          ),
          { traceId }
        );
        console.table(
          productsResult.data.products.map((p: AdminProduct) => ({
            ID: p.id.split("/").pop(),
            Título: p.title,
            Precio: `${p.price} ${p.currency}`,
            Stock: p.inventoryQuantity,
            Estado: p.status,
          }))
        );
      } else {
        const errorMsg = `Fallo al obtener productos de la Admin API: ${productsResult.error}`;
        logger.error(chalk.red(`  ❌ ${errorMsg}`), { traceId });
        fullReport.errors.push(errorMsg);
      }
    }
  } catch (error) {
    const errorMsg = `Excepción no controlada en el script: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(chalk.red(`  🔥 ${errorMsg}`), { traceId });
    fullReport.errors.push(errorMsg);
  } finally {
    const reportDir = path.resolve(process.cwd(), "shopify", "reports");
    await fs.mkdir(reportDir, { recursive: true });
    const reportPath = path.resolve(
      reportDir,
      `latest-shopify-diagnostics.json`
    );

    logger.traceEvent(
      traceId,
      `Escribiendo informe de diagnóstico en: ${reportPath}`
    );
    await fs.writeFile(reportPath, JSON.stringify(fullReport, null, 2));

    if (fullReport.errors.length > 0) {
      logger.error(chalk.red.bold("\n❌ Diagnóstico completado CON ERRORES."), {
        traceId,
      });
    } else {
      logger.success(
        chalk.green.bold(
          "\n✅ Diagnóstico completado SIN ERRORES. Informe generado."
        ),
        { traceId }
      );
    }

    logger.endGroup();
    logger.endTrace(traceId);

    if (fullReport.errors.length > 0) {
      process.exit(1);
    }
  }
}

runShopifyDiagnostics();
