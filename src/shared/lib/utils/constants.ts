// RUTA: src/shared/lib/utils/constants.ts
/**
 * @file constants.ts
 * @description SSoT para las constantes globales del ecosistema de la aplicación.
 *              Este módulo es EXCLUSIVO DEL SERVIDOR.
 * @version 2.0.0 (Server-Only Enforcement)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server-only";

import { logger } from "@/shared/lib/logging";

logger.trace("[constants.ts] Módulo de constantes cargado.");

export const TAGS = {
  products: "products",
  cart: "cart",
} as const;

export const SHOPIFY_GRAPHQL_API_ENDPOINT = "/api/2024-04/graphql.json";
