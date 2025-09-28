// RUTA: scripts/diagnostics/diag-shopify.ts
/**
 * @file diag-shopify.ts
 * @description Herramienta de diagnóstico de élite para verificar la configuración
 *              y las capacidades de integración con Shopify (GraphQL Admin y Storefront API).
 *              Este script es verboso y reporta las funcionalidades posibles según los scopes
 *              y consulta datos reales de productos de la Admin API.
 * @version 1.5.0 (Diagnóstico de Contenido de Tienda)
 * @author RaZ Podestá - MetaShark Tech
 * @usage pnpm tsx scripts/run-with-env.ts scripts/diagnostics/diag-shopify.ts
 */
import chalk from "chalk";
import { loadEnvironment } from "./_utils";
import { logger } from "../../src/shared/lib/logging";
import * as fs from "fs/promises";
import * as path from "path";

// --- CLIENTES DE SHOPIFY (Simplificados para diagnóstico) ---
interface ShopifyError {
  message: string;
  [key: string]: unknown; // Permite otras propiedades de error sin 'any'
}

interface ShopifyResponse {
  data?: {
    shop?: {
      name?: string;
    };
  };
  errors?: ShopifyError[];
}

interface AdminApiCapability {
  read: boolean;
  write: boolean;
}

interface StorefrontApiCapability {
  unauthenticated_read: boolean;
  unauthenticated_write: boolean;
}

// --- Importar la Server Action para obtener productos Admin ---
import {
  getAdminProductsAction,
  type AdminProduct,
} from "@/shared/lib/actions/shopify";

interface ShopifyDiagnosticReport {
  connection_status: {
    admin_api?: "OK" | "FAILED" | "SKIPPED";
    storefront_api?: "OK" | "FAILED" | "SKIPPED";
  };
  shop_name?: string;
  admin_api_info: {
    scopes_expected: string[];
    capabilities: Record<string, AdminApiCapability>;
    products_sample?: AdminProduct[]; // Añadimos esto para el reporte
  };
  storefront_api_info: {
    scopes_expected: string[];
    capabilities: Record<string, StorefrontApiCapability>;
  };
  errors: string[];
}

async function shopifyGraphQLRequest(
  url: string,
  accessToken: string,
  query: string,
  apiVersion: string,
  isStorefront: boolean = false
): Promise<ShopifyResponse> {
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
      headers: headers,
      body: JSON.stringify({ query }),
    });

    const json: { errors?: ShopifyError[]; data?: ShopifyResponse["data"] } =
      await response.json();

    if (!response.ok) {
      logger.error(`[Shopify API] HTTP Error: ${response.status}`, {
        status: response.status,
        body: json,
      });
      return {
        errors: json.errors || [
          { message: `HTTP Error ${response.status}: ${response.statusText}` },
        ],
      };
    }
    return json;
  } catch (e) {
    logger.error(
      `[Shopify API] Fetch Error: ${e instanceof Error ? e.message : String(e)}`
    );
    return {
      errors: [
        {
          message: `Fetch failed: ${e instanceof Error ? e.message : String(e)}`,
        },
      ],
    };
  }
}

// --- Listado de Scopes para Auditoría (Extraído de tus capturas de pantalla) ---
const ADMIN_API_SCOPES_TO_CHECK = [
  "read_analytics",
  "read_apps",
  "read_assigned_fulfillment_orders",
  "read_brand",
  "read_brand_settings",
  "read_cart_transforms",
  "read_checkout_branding_settings",
  "read_companies",
  "read_customers",
  "read_customer_data_erasure",
  "read_customer_events",
  "read_customer_merge",
  "read_customer_payment_methods",
  "read_delivery_customizations",
  "read_discounts",
  "read_discounts_allocator_functions",
  "read_discovery",
  "read_disputes",
  "read_draft_orders",
  "read_files",
  "read_fulfillments",
  "read_fulfillment_constraint_rules",
  "read_gdpr_data_request",
  "read_gift_card_adjustments",
  "read_gift_cards",
  "read_gift_card_transactions",
  "read_inventory",
  "read_inventory_shipments",
  "read_inventory_shipments_received_items",
  "read_inventory_transfers",
  "read_legal_policies",
  "read_locales",
  "read_locations",
  "read_marketing_events",
  "read_marketing_integrated_campaigns",
  "read_markets",
  "read_markets_home",
  "read_merchant_managed_fulfillment_orders",
  "read_metaobject_definitions",
  "read_metaobjects",
  "read_mobile_platform_applications",
  "read_online_store_navigation",
  "read_online_store_pages",
  "read_order_edits",
  "read_orders",
  "read_own_subscription_contracts",
  "read_packing_slip_templates",
  "read_payment_customizations",
  "read_payment_gateways",
  "read_payment_mandate",
  "read_payment_terms",
  "read_pixels",
  "read_custom_pixels",
  "read_price_rules",
  "read_product_feeds",
  "read_product_listings",
  "read_products",
  "read_product_pickup_locations",
  "read_product_tags",
  "read_profiles",
  "read_publications",
  "read_purchase_options",
  "read_reports",
  "read_resource_feedbacks",
  "read_returns",
  "read_script_tags",
  "read_selling_plans",
  "read_server_pixels",
  "read_shipping",
  "read_shopify_payments",
  "read_shopify_payments_accounts",
  "read_shopify_payments_bank_accounts",
  "read_shopify_payments_dispute_evidences",
  "read_shopify_payments_disputes",
  "read_shopify_payments_payouts",
  "read_shopify_payments_provider_accounts_sensitive",
  "read_store_credit_account_transactions",
  "read_store_credit_accounts",
  "read_themes",
  "read_theme_code",
  "read_third_party_fulfillment_orders",
  "read_translations",
  "read_validations",
  "write_all_orders",
  "write_analytics",
  "write_apps",
  "write_assigned_fulfillment_orders",
  "write_brand",
  "write_brand_settings",
  "write_cart_transforms",
  "write_checkout_branding_settings",
  "write_companies",
  "write_customers",
  "write_customer_data_erasure",
  "write_customer_events",
  "write_customer_merge",
  "write_delivery_customizations",
  "write_discounts",
  "write_discounts_allocator_functions",
  "write_discovery",
  "write_disputes",
  "write_draft_orders",
  "write_files",
  "write_fulfillments",
  "write_fulfillment_constraint_rules",
  "write_gift_card_adjustments",
  "write_gift_cards",
  "write_gift_card_transactions",
  "write_inventory",
  "write_inventory_shipments",
  "write_inventory_shipments_received_items",
  "write_inventory_transfers",
  "write_legal_policies",
  "write_locales",
  "write_locations",
  "write_marketing_events",
  "write_marketing_integrated_campaigns",
  "write_markets",
  "write_markets_home",
  "write_merchant_managed_fulfillment_orders",
  "write_metaobject_definitions",
  "write_metaobjects",
  "write_mobile_platform_applications",
  "write_online_store_navigation",
  "write_online_store_pages",
  "write_order_edits",
  "write_orders",
  "write_own_subscription_contracts",
  "write_packing_slip_templates",
  "write_payment_customizations",
  "write_payment_gateways",
  "write_payment_mandate",
  "write_payment_terms",
  "write_pixels",
  "write_custom_pixels",
  "write_price_rules",
  "write_product_feeds",
  "write_product_listings",
  "write_products",
  "write_publications",
  "write_purchase_options",
  "write_reports",
  "write_resource_feedbacks",
  "write_returns",
  "write_script_tags",
  "write_selling_plans",
  "write_server_pixels",
  "write_shipping",
  "write_shopify_payments",
  "write_shopify_payments_accounts",
  "write_shopify_payments_bank_accounts",
  "write_shopify_payments_dispute_evidences",
  "write_shopify_payments_disputes",
  "write_shopify_payments_payouts",
  "write_shopify_payments_provider_accounts_sensitive",
  "write_store_credit_account_transactions",
  "write_store_credit_accounts",
  "write_themes",
  "write_theme_code",
  "write_third_party_fulfillment_orders",
  "write_translations",
  "write_validations",
];

const STOREFRONT_API_SCOPES_TO_CHECK = [
  "unauthenticated_read_content",
  "unauthenticated_read_metaobjects",
  "unauthenticated_read_selling_plans",
  "unauthenticated_write_checkouts",
  "unauthenticated_read_checkouts",
  "unauthenticated_write_customers",
  "unauthenticated_read_customers",
  "unauthenticated_read_customer_tags",
  "unauthenticated_write_bulk_operations",
  "unauthenticated_read_bulk_operations",
  "unauthenticated_read_bundles",
  "unauthenticated_read_gates",
  "unauthenticated_write_gates",
  "unauthenticated_write_metaobjects",
  "unauthenticated_write_product_inventory",
  "unauthenticated_read_product_inventory",
  "unauthenticated_write_product_listings",
  "unauthenticated_read_product_listings",
  "unauthenticated_write_product_pickup_locations",
  "unauthenticated_read_product_pickup_locations",
  "unauthenticated_write_product_tags",
  "unauthenticated_read_product_tags",
  "unauthenticated_write_selling_plans",
  "unauthenticated_read_shop_pay_installments_pricing",
];

async function runShopifyDiagnostics() {
  console.clear();
  logger.startGroup(
    chalk.cyan.bold("🛍️  Iniciando Diagnóstico Integral de Shopify...")
  );

  // Asegurarse de que las variables Shopify estén en .env.local
  loadEnvironment([
    "SHOPIFY_STORE_DOMAIN",
    "SHOPIFY_STOREFRONT_ACCESS_TOKEN",
    "SHOPIFY_ADMIN_ACCESS_TOKEN",
    "SHOPIFY_API_VERSION",
  ]);

  const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
  const STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-07"; // Usar una versión por defecto si no está en .env

  const STOREFRONT_URL = `https://${SHOP_DOMAIN}/api/${API_VERSION}/graphql.json`;
  const ADMIN_URL = `https://${SHOP_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;

  const fullReport: ShopifyDiagnosticReport = {
    // Usar la interfaz tipada
    connection_status: {},
    admin_api_info: {
      scopes_expected: ADMIN_API_SCOPES_TO_CHECK,
      capabilities: {},
    },
    storefront_api_info: {
      scopes_expected: STOREFRONT_API_SCOPES_TO_CHECK,
      capabilities: {},
    },
    errors: [],
  };

  logger.info(chalk.gray(`   - Dominio de la tienda: ${SHOP_DOMAIN}`));
  logger.info(chalk.gray(`   - Versión de la API: ${API_VERSION}`));
  logger.info(
    chalk.gray(
      `   - Admin Access Token (parcial): ${ADMIN_ACCESS_TOKEN ? ADMIN_ACCESS_TOKEN.substring(0, 10) + "..." : "N/A"}`
    )
  );
  logger.info(
    chalk.gray(
      `   - Storefront Access Token (parcial): ${STOREFRONT_ACCESS_TOKEN ? STOREFRONT_ACCESS_TOKEN.substring(0, 10) + "..." : "N/A"}`
    )
  );

  // --- 1. Probar Conexión a Admin API ---
  logger.info(chalk.blueBright("\n--- Probando Admin API ---"));
  if (!ADMIN_ACCESS_TOKEN) {
    const errorMsg =
      "SHOPIFY_ADMIN_ACCESS_TOKEN no está configurado. No se puede probar la Admin API.";
    logger.error(chalk.red(`  ❌ ${errorMsg}`));
    fullReport.connection_status.admin_api = "SKIPPED";
    fullReport.errors.push(errorMsg);
  } else {
    try {
      const adminQuery = `{ shop { name } }`;
      const adminResponse = await shopifyGraphQLRequest(
        ADMIN_URL,
        ADMIN_ACCESS_TOKEN!,
        adminQuery,
        API_VERSION
      );

      if (adminResponse.errors) {
        throw new Error(
          `Admin API Error: ${JSON.stringify(adminResponse.errors)}`
        );
      }
      if (adminResponse.data?.shop?.name) {
        // Acceso seguro al nombre de la tienda
        fullReport.connection_status.admin_api = "OK";
        fullReport.shop_name = adminResponse.data.shop.name;
        logger.success(
          chalk.green(
            `  ✅ Conexión a Admin API exitosa. Nombre de la tienda: ${fullReport.shop_name}`
          )
        );

        // Reportar capacidades de Admin API
        ADMIN_API_SCOPES_TO_CHECK.forEach((scope) => {
          const [action, resource] = scope.split("_", 2); // Divide 'read_products' en ['read', 'products']
          if (!fullReport.admin_api_info.capabilities[resource]) {
            fullReport.admin_api_info.capabilities[resource] = {
              read: false,
              write: false,
            };
          }
          if (action === "read" || action === "write") {
            // Asegurar que 'action' sea 'read' o 'write'
            fullReport.admin_api_info.capabilities[resource][action] = true;
          }
        });
        logger.info(
          chalk.gray(
            "     Capacidades de Admin API esperadas reportadas en JSON."
          )
        );

        // --- INICIO DE NUEVA FUNCIONALIDAD: OBTENER PRODUCTOS ADMIN ---
        logger.info(
          chalk.blueBright("\n--- Obteniendo Productos con Admin API ---")
        );
        try {
          const productsResult = await getAdminProductsAction({ first: 3 }); // Obtener los primeros 3 productos
          if (productsResult.success) {
            fullReport.admin_api_info.products_sample =
              productsResult.data.products;
            logger.success(
              chalk.green(
                `  ✅ Se obtuvieron ${productsResult.data.products.length} productos de la Admin API.`
              )
            );
            console.table(
              productsResult.data.products.map((p) => ({
                ID: p.id.split("/").pop(), // Solo el ID numérico
                Título: p.title,
                Precio: `${p.price} ${p.currency}`,
                Stock: p.inventoryQuantity,
                Estado: p.status,
              }))
            );
          } else {
            const errorMsg = `Fallo al obtener productos de la Admin API: ${productsResult.error}`;
            logger.error(chalk.red(`  ❌ ${errorMsg}`));
            fullReport.errors.push(errorMsg);
          }
        } catch (productsError) {
          const errorMsg = `Excepción al obtener productos de la Admin API: ${productsError instanceof Error ? productsError.message : String(productsError)}`;
          logger.error(chalk.red(`  ❌ ${errorMsg}`));
          fullReport.errors.push(errorMsg);
        }
        // --- FIN DE NUEVA FUNCIONALIDAD ---
      } else {
        throw new Error(
          "Respuesta de Admin API inesperada (sin nombre de tienda)."
        );
      }
    } catch (error) {
      fullReport.connection_status.admin_api = "FAILED";
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      fullReport.errors.push(`Admin API Connection: ${errorMessage}`);
      logger.error(
        chalk.red(`  ❌ Fallo al conectar con Admin API: ${errorMessage}`)
      );
    }
  }

  // --- 2. Probar Conexión a Storefront API ---
  logger.info(chalk.blueBright("\n--- Probando Storefront API ---"));
  if (!STOREFRONT_ACCESS_TOKEN) {
    const errorMsg =
      "SHOPIFY_STOREFRONT_ACCESS_TOKEN no está configurado. No se puede probar la Storefront API. Por favor, crea un token de acceso a la Storefront API en tu admin de Shopify (Configuración -> Apps y canales de ventas -> Desarrollo de apps -> Tu app -> Credenciales de la API -> Storefront API -> Crear un token de acceso).";
    logger.warn(chalk.yellow(`  ⚠️  ${errorMsg}`));
    fullReport.connection_status.storefront_api = "SKIPPED";
    fullReport.errors.push(errorMsg);
  } else {
    try {
      const storefrontQuery = `{ shop { name } }`;
      const storefrontResponse = await shopifyGraphQLRequest(
        STOREFRONT_URL,
        STOREFRONT_ACCESS_TOKEN!,
        storefrontQuery,
        API_VERSION,
        true
      );

      if (storefrontResponse.errors) {
        throw new Error(
          `Storefront API Error: ${JSON.stringify(storefrontResponse.errors)}`
        );
      }
      if (storefrontResponse.data?.shop?.name) {
        // Acceso seguro al nombre de la tienda
        fullReport.connection_status.storefront_api = "OK";
        logger.success(
          chalk.green(
            `  ✅ Conexión a Storefront API exitosa. Nombre de la tienda: ${storefrontResponse.data.shop.name}`
          )
        );

        // Reportar capacidades de Storefront API
        STOREFRONT_API_SCOPES_TO_CHECK.forEach((scope) => {
          // Asume el formato 'unauthenticated_action_resource'
          const parts = scope.split("_");
          if (parts.length >= 3 && parts[0] === "unauthenticated") {
            const action =
              `${parts[0]}_${parts[1]}` as keyof StorefrontApiCapability; // 'unauthenticated_read' o 'unauthenticated_write'
            const resource = parts.slice(2).join("_");

            if (!fullReport.storefront_api_info.capabilities[resource]) {
              fullReport.storefront_api_info.capabilities[resource] = {
                unauthenticated_read: false,
                unauthenticated_write: false,
              };
            }
            if (
              action in fullReport.storefront_api_info.capabilities[resource]
            ) {
              fullReport.storefront_api_info.capabilities[resource][action] =
                true;
            }
          } else {
            logger.warn(
              `Scope de Storefront API inesperado o mal formateado: ${scope}`
            );
          }
        });
        logger.info(
          chalk.gray(
            "     Capacidades de Storefront API esperadas reportadas en JSON."
          )
        );
      } else {
        throw new Error(
          "Respuesta de Storefront API inesperada (sin nombre de tienda)."
        );
      }
    } catch (error) {
      fullReport.connection_status.storefront_api = "FAILED";
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      fullReport.errors.push(`Storefront API Connection: ${errorMessage}`);
      logger.error(
        chalk.red(`  ❌ Fallo al conectar con Storefront API: ${errorMessage}`)
      );
    }
  }

  // --- Generar Reporte JSON ---
  const reportDir = path.resolve(process.cwd(), "shopify/reports");
  await fs.mkdir(reportDir, { recursive: true });
  const reportPath = path.resolve(reportDir, `latest-shopify-diagnostics.json`);
  await fs.writeFile(reportPath, JSON.stringify(fullReport, null, 2));

  if (fullReport.errors.length > 0) {
    logger.error(
      chalk.red.bold(
        "\n❌ Diagnóstico de Shopify completado CON ERRORES. Revisa el reporte y los logs."
      )
    );
    process.exit(1);
  } else {
    logger.success(
      chalk.green.bold(
        "\n✅ Diagnóstico de Shopify completado SIN ERRORES. ¡Las conexiones son saludables!"
      )
    );
  }

  logger.endGroup();
}

runShopifyDiagnostics().catch((e) => {
  logger.error(
    chalk.red.bold("\n🔥 Fallo fatal en el script de diagnóstico de Shopify:"),
    e
  );
  process.exit(1);
});
