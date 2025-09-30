// RUTA: src/shared/lib/actions/shopify/index.ts
/**
 * @file index.ts
 * @description Fachada pública y SSoT para la Capa de Acceso a Datos de Shopify.
 * @version 11.0.0 (Admin Shapers Integration)
 * @author L.I.A. Legacy
 */
import "server-only";
import { logger } from "@/shared/lib/logging";

// --- [INYECCIÓN DE OBSERVABILIDAD] ---
logger.trace(
  "[Shopify DAL Façade] Módulo de acciones y shapers de Shopify cargado."
);

// Clientes dedicados de la API
export * from "@shared/lib/shopify/storefront-client";
export * from "@shared/lib/shopify/admin-client";

// Operaciones de API de alto nivel (que usan los clientes anteriores)
export * from "@shared/lib/shopify/products";
export * from "@shared/lib/shopify/cart";
export * from "@shared/lib/shopify/shapers";
export * from "./getAdminProducts.action";
export * from "@shared/lib/shopify/admin.shapers.ts";
