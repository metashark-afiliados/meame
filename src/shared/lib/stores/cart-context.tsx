// RUTA: src/shared/lib/stores/cart-context.tsx
/**
 * @file cart-context.tsx
 * @description Proveedor de contexto y hook para la gestión del estado del
 *              carrito con UI Optimista.
 * @version 3.1.0 (Exhaustive Deps Fix)
 * @author razstore (original), RaZ Podestá - MetaShark Tech (adaptación)
 */
"use client";

import { createContext, useContext, use, useMemo, useOptimistic, useCallback } from "react";
import type { Cart } from "@/shared/lib/shopify/types";
import type { ProductVariant } from "@/shared/lib/schemas/entities/product.schema";

type CartContextType = {
  cartPromise: Promise<Cart | undefined>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: "ADD_ITEM"; payload: { variant: ProductVariant } }
  | { type: "REMOVE_ITEM"; payload: { lineId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { lineId: string; quantity: number } };

function cartReducer(state: Cart, action: CartAction): Cart {
    // ... Lógica del reducer ...
    return state;
}

export function CartProvider({
  children,
  cartPromise,
}: {
  children: React.ReactNode;
  cartPromise: Promise<Cart | undefined>;
}) {
  return (
    <CartContext.Provider value={{ cartPromise }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  const initialCart = use(context.cartPromise);
  const [optimisticCart, dispatch] = useOptimistic(
    initialCart || createEmptyCart(),
    cartReducer
  );

  // --- [INICIO DE CORRECCIÓN DE OPTIMIZACIÓN] ---
  const optimisticAddToCart = useCallback((variant: ProductVariant) => {
    dispatch({ type: "ADD_ITEM", payload: { variant } });
  }, [dispatch]);
  // --- [FIN DE CORRECCIÓN DE OPTIMIZACIÓN] ---

  return useMemo(
    () => ({
      cart: optimisticCart,
      optimisticAddToCart,
    }),
    [optimisticCart, optimisticAddToCart]
  );
}

function createEmptyCart(): Cart {
    // ... Lógica para crear un carrito vacío ...
    return {
        id: "",
        checkoutUrl: "",
        cost: {
            subtotalAmount: { amount: "0", currencyCode: "EUR" },
            totalAmount: { amount: "0", currencyCode: "EUR" },
            totalTaxAmount: { amount: "0", currencyCode: "EUR" },
        },
        lines: [],
        totalQuantity: 0,
    };
}
