// RUTA: src/shared/lib/shopify/index.ts
/**
 * @file index.ts
 * @description Fachada pública y SSoT para la Capa de Acceso a Datos de Shopify.
 * @version 8.0.0 (Atomic Architecture)
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";

// Re-exporta la API pública desde los módulos atomizados.
export * from "./products";
export * from "./cart";
export * from "./shapers"; // Exportamos los shapers para que sean consumibles
