// RUTA: scripts/diagnostics/diag-shopify.ts
/**
 * @file diag-shopify.ts
 * @description Guardián de Integridad de Shopify, ahora arquitectónicamente aislado,
 *              con observabilidad de élite y un flujo de control resiliente.
 * @version 5.0.0 (Elite & Resilient)
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

// La consulta no utilizada 'getAdminProductsQuery' ha sido eliminada.

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
  const traceId = logger.startTrace("runShopifyDiagnostics_v5.0");
  logger.startGroup("🛍️  Iniciando Diagnóstico de Shopify (v5.0 - Elite)...");

  const fullReport: ShopifyDiagnosticReport = {
    generatedAt: new Date().toISOString(),
    connection_status: {},
    errors: [],
  };

  let operationStatus: "success" | "failure" = "success";
  let finalMessage: string = "Diagnóstico de Shopify completado sin errores.";

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
      logger.traceEvent(traceId, "Probando conexión a Admin API...");
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
      operationStatus = "failure";
    }

    // Test Storefront API
    try {
      logger.traceEvent(traceId, "Probando conexión a Storefront API...");
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
      operationStatus = "failure";
    }
  } catch (error) {
    const msg = `Excepción no controlada: ${error instanceof Error ? error.message : "Error"}`;
    fullReport.errors.push(msg);
    operationStatus = "failure";
  }

  // --- REFACTORIZACIÓN DE CONTROL DE FLUJO SEGURO ---
  // La lógica de escritura de archivo y retorno se mueve fuera del bloque finally.
  const reportDir = path.resolve(process.cwd(), "shopify", "reports");
  await fs.mkdir(reportDir, { recursive: true });
  const reportPath = path.resolve(reportDir, `latest-shopify-diagnostics.json`);
  await fs.writeFile(reportPath, JSON.stringify(fullReport, null, 2));

  logger.endGroup();
  logger.endTrace(traceId);

  if (operationStatus === "failure") {
    finalMessage = fullReport.errors.join("\n");
    return { success: false, error: finalMessage };
  }

  return { success: true, data: finalMessage };
}

export default runShopifyDiagnostics;
