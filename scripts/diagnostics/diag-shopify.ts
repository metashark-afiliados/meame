// RUTA: scripts/diagnostics/diag-shopify.ts
/**
 * @file diag-shopify.ts
 * @description Guardián de Integridad de Shopify, ahora arquitectónicamente aislado.
 *              v4.0.0 (Architectural Isolation): Refactorizado para no depender
 *              de las Server Actions de la aplicación, resolviendo errores de
 *              frontera Servidor-Cliente durante la ejecución de scripts.
 * @version 4.0.0
 * @author L.I.A. Legacy
 */
import chalk from "chalk";
import { loadEnvironment } from "./_utils";
import { logger } from "../../src/shared/lib/logging";
import * as fs from "fs/promises";
import * as path from "path";
import type { ActionResult } from "@/shared/lib/types/actions.types";

// --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA: LÓGICA AISLADA ---

// Se mueven los contratos y la lógica de fetch aquí, dentro del script.
interface ShopifyError {
  message: string;
}

interface ShopifyDiagnosticReport {
  generatedAt: string;
  connection_status: {
    admin_api?: "OK" | "FAILED" | "SKIPPED";
    storefront_api?: "OK" | "FAILED" | "SKIPPED";
  };
  shop_name?: string;
  errors: string[];
}

const adminProductFragment = `
  fragment adminProduct on Product {
    id
    title
    status
    createdAt
    updatedAt
  }
`;

const getAdminProductsQuery = `
  query getAdminProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          ...adminProduct
        }
      }
    }
  }
  ${adminProductFragment}
`;

async function shopifyGraphQLRequest<T>(
  url: string,
  accessToken: string,
  query: string,
  isStorefront: boolean = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (isStorefront) {
    headers["X-Shopify-Storefront-Access-Token"] = accessToken;
  } else {
    headers["X-Shopify-Access-Token"] = accessToken;
  }
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  });
  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: ShopifyError) => e.message).join("\n"));
  }
  return json;
}

// --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

async function runShopifyDiagnostics(): Promise<ActionResult<string>> {
  const traceId = logger.startTrace("runShopifyDiagnostics_v4.0");
  logger.startGroup("🛍️  Iniciando Diagnóstico de Shopify (v4.0 - Aislado)...");

  const fullReport: ShopifyDiagnosticReport = {
    generatedAt: new Date().toISOString(),
    connection_status: {},
    errors: [],
  };

  try {
    loadEnvironment([
      "SHOPIFY_STORE_DOMAIN",
      "SHOPIFY_STOREFRONT_ACCESS_TOKEN",
      "SHOPIFY_ADMIN_ACCESS_TOKEN",
      "SHOPIFY_API_VERSION",
    ]);

    const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
    const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
    const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;
    const API_VERSION = process.env.SHOPIFY_API_VERSION!;

    const ADMIN_URL = `https://${SHOP_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;
    const STOREFRONT_URL = `https://${SHOP_DOMAIN}/api/${API_VERSION}/graphql.json`;

    // Test Admin API
    try {
      const adminResponse = await shopifyGraphQLRequest<{
        data: { shop: { name: string } };
      }>(ADMIN_URL, ADMIN_TOKEN, `{ shop { name } }`);
      fullReport.shop_name = adminResponse.data.shop.name;
      fullReport.connection_status.admin_api = "OK";
      console.log(
        chalk.green(
          `  ✅ Conexión a Admin API exitosa. Tienda: ${fullReport.shop_name}`
        )
      );
    } catch (error) {
      const msg = `Fallo al conectar con Admin API: ${error instanceof Error ? error.message : "Error"}`;
      fullReport.errors.push(msg);
      fullReport.connection_status.admin_api = "FAILED";
      console.error(chalk.red(`  ❌ ${msg}`));
    }

    // Test Storefront API
    try {
      await shopifyGraphQLRequest(
        STOREFRONT_URL,
        STOREFRONT_TOKEN,
        `{ shop { name } }`,
        true
      );
      fullReport.connection_status.storefront_api = "OK";
      console.log(chalk.green("  ✅ Conexión a Storefront API exitosa."));
    } catch (error) {
      const msg = `Fallo al conectar con Storefront API: ${error instanceof Error ? error.message : "Error"}`;
      fullReport.errors.push(msg);
      fullReport.connection_status.storefront_api = "FAILED";
      console.error(chalk.red(`  ❌ ${msg}`));
    }
  } catch (error) {
    const msg = `Excepción no controlada: ${error instanceof Error ? error.message : "Error"}`;
    fullReport.errors.push(msg);
  } finally {
    const reportDir = path.resolve(process.cwd(), "shopify", "reports");
    await fs.mkdir(reportDir, { recursive: true });
    const reportPath = path.resolve(
      reportDir,
      `latest-shopify-diagnostics.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(fullReport, null, 2));

    if (fullReport.errors.length > 0) {
      logger.endGroup();
      return { success: false, error: fullReport.errors.join("\n") };
    }

    logger.endGroup();
    return {
      success: true,
      data: "Diagnóstico de Shopify completado sin errores.",
    };
  }
}

export default runShopifyDiagnostics;
