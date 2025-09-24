// RUTA: shared/lib/utils/constants.ts
/**
 * @file constants.ts
 * @description SSoT para las constantes globales del ecosistema de la aplicación.
 *              v1.1.0 (Module Load Observability): Se añade un log de traza
 *              al inicio del módulo para confirmar su carga, cumpliendo con el
 *              Pilar III de Observabilidad.
 * @version 1.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { logger } from "@/shared/lib/logging"; // Importa el logger

// --- INICIO DE MEJORA: OBSERVABILIDAD DE CARGA DE MÓDULO ---
logger.trace("[constants.ts] Módulo de constantes cargado y listo para usar.");
// --- FIN DE MEJORA: OBSERVABILIDAD DE CARGA DE MÓDULO ---

/**
 * @const TAGS
 * @description Etiquetas de caché utilizadas para la revalidación de datos bajo demanda en Next.js.
 */
export const TAGS = {
  products: "products",
  cart: "cart",
} as const;

/**
 * @const SHOPIFY_GRAPHQL_API_ENDPOINT
 * @description El endpoint canónico para la API GraphQL de Shopify Storefront.
 */
export const SHOPIFY_GRAPHQL_API_ENDPOINT = "/api/2024-04/graphql.json";
