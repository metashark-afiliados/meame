// Ruta correcta: src/shared/lib/commerce/cart.ts
/**
 * @file cart.ts
 * @description Capa de datos del lado del servidor para obtener el carrito.
 * @version 2.2.0 (Architectural Realignment)
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import { cookies } from "next/headers";
// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
import { getShopifyCart } from "@/shared/lib/shopify";
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---
import type { Cart } from "@/shared/lib/shopify/types";

export async function getCart(): Promise<Cart | undefined> {
  const cartId = cookies().get("cartId")?.value;
  if (!cartId) {
    return undefined;
  }
  return getShopifyCart(cartId);
}
// Ruta correcta: src/shared/lib/commerce/cart.ts
