// Ruta correcta: src/shared/lib/actions/commerce/cart.actions.ts
/**
 * @file cart.actions.ts
 * @description Server Actions soberanas para la gestión del carrito de compras.
 * @version 2.2.0 (Integrity Restoration)
 * @author razstore (original), RaZ Podestá - MetaShark Tech (adaptación)
 */
"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { logger } from "@/shared/lib/logging";
import { TAGS } from "@/shared/lib/utils/constants";
import {
  addToCart,
  createCart,
  removeFromCart,
  updateCart,
} from "@/shared/lib/services/shopify";
import { getCart } from "@/shared/lib/commerce/cart";

export async function addItem(
  prevState: unknown,
  formData: FormData
): Promise<string | undefined> {
  const traceId = logger.startTrace("addItemAction");
  const selectedVariantId = formData.get("variantId") as string | undefined;

  let cart = await getCart();
  let cartId = cart?.id;

  if (!cartId || !cart) {
    try {
      logger.traceEvent(traceId, "Carrito no encontrado, creando uno nuevo...");
      cart = await createCart();
      cartId = cart.id;
      cookies().set("cartId", cartId);
      logger.success("[addItemAction] Nuevo carrito creado.", { cartId });
    } catch (e) {
      logger.error("[addItemAction] Fallo al crear el carrito.", {
        error: e,
        traceId,
      });
      return "cart.errors.createCartFailed";
    }
  }

  if (!selectedVariantId) {
    logger.warn("[addItemAction] Intento de añadir sin variantId.", {
      traceId,
    });
    return "cart.errors.addItemFailed";
  }

  try {
    logger.traceEvent(traceId, "Añadiendo item a la API de Shopify...");
    await addToCart(cartId, [
      { merchandiseId: selectedVariantId, quantity: 1 },
    ]);
    revalidateTag(TAGS.cart);
    logger.success("[addItemAction] Item añadido con éxito.", {
      cartId,
      variantId: selectedVariantId,
    });
  } catch (e) {
    logger.error("[addItemAction] Fallo al añadir item al carrito.", {
      error: e,
      cartId,
      traceId,
    });
    return "cart.errors.addItemFailed";
  }
}

export async function removeItem(
  prevState: unknown,
  lineId: string
): Promise<string | undefined> {
  const cartId = cookies().get("cartId")?.value;
  if (!cartId) return "cart.errors.removeItemFailed";
  try {
    await removeFromCart(cartId, [lineId]);
    revalidateTag(TAGS.cart);
  } catch (e) {
    logger.error("[removeItemAction] Fallo al eliminar item.", {
      error: e,
      cartId,
    });
    return "cart.errors.removeItemFailed";
  }
}

export async function updateItemQuantity(
  prevState: unknown,
  payload: {
    lineId: string;
    variantId: string;
    quantity: number;
  }
): Promise<string | undefined> {
  const cartId = cookies().get("cartId")?.value;
  if (!cartId) return "cart.errors.updateItemFailed";
  try {
    if (payload.quantity === 0) {
      await removeFromCart(cartId, [payload.lineId]);
    } else {
      await updateCart(cartId, [
        {
          id: payload.lineId,
          merchandiseId: payload.variantId,
          quantity: payload.quantity,
        },
      ]);
    }
    revalidateTag(TAGS.cart);
  } catch (e) {
    logger.error("[updateItemQuantity] Fallo al actualizar cantidad.", {
      error: e,
      cartId,
    });
    return "cart.errors.updateItemFailed";
  }
}
// Ruta correcta: src/shared/lib/actions/commerce/cart.actions.ts
