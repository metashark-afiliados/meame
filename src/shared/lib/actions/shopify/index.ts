// RUTA: src/shared/lib/actions/shopify/index.ts
/**
 * @file index.ts
 * @description Fachada pública y SSoT para la Capa de Acceso a Datos de Shopify.
 * @version 10.0.0 (Admin Products Action)
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";

// Clientes dedicados de la API
export * from "@shared/lib/shopify/storefront-client";
export * from "@shared/lib/shopify/admin-client";

// Operaciones de API de alto nivel (que usan los clientes anteriores)
export * from "@shared/lib/shopify/products";
export * from "@shared/lib/shopify/cart";
export * from "@shared/lib/shopify/shapers";
export * from "./getAdminProducts.action"; // <-- NUEVA EXPORTACIÓN
