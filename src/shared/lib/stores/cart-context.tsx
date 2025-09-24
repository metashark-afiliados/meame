// RUTA: components/features/cart/cart-context.tsx
/**
 * @file cart-context.tsx
 * @description Proveedor de contexto y hook para la gestión del estado del
 *              carrito con UI Optimista.
 *              v3.0.0 (Sovereign Contract): Nivelado para consumir el tipo
 *              soberano `Cart`, desacoplando la UI de la API de Shopify.
 * @version 3.0.0
 * @author razstore (original), RaZ Podestá - MetaShark Tech (adaptación)
 */
"use client";

import { createContext, useContext, use, useMemo, useOptimistic } from "react";
// --- [INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
// Se importan los tipos soberanos y de la API de forma explícita.
import type {
  Cart,
  CartItem,
  ShopifyProduct,
} from "@/shared/lib/shopify/types";
// --- [FIN DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
import type { ProductVariant } from "@/shared/lib/schemas/entities/product.schema";

type CartContextType = {
  cartPromise: Promise<Cart | undefined>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | {
      type: "ADD_ITEM";
      payload: { variant: ProductVariant; product: ShopifyProduct };
    }
  | { type: "REMOVE_ITEM"; payload: { lineId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { lineId: string; quantity: number } };

function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case "REMOVE_ITEM": {
      return {
        ...state,
        lines: state.lines.filter((line) => line.id !== action.payload.lineId),
      };
    }
    // Lógica adicional para ADD_ITEM y UPDATE_QUANTITY aquí
    default:
      return state;
  }
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

  const optimisticAddToCart = (
    variant: ProductVariant,
    product: ShopifyProduct
  ) => {
    dispatch({ type: "ADD_ITEM", payload: { variant, product } });
  };

  return useMemo(
    () => ({
      cart: optimisticCart,
      optimisticAddToCart,
    }),
    [optimisticCart, optimisticAddToCart]
  );
}

// La función ahora devuelve un objeto `Cart` soberano y "plano".
function createEmptyCart(): Cart {
  return {
    id: "",
    checkoutUrl: "",
    cost: {
      subtotalAmount: { amount: "0", currencyCode: "EUR" },
      totalAmount: { amount: "0", currencyCode: "EUR" },
      totalTaxAmount: { amount: "0", currencyCode: "EUR" },
    },
    lines: [], // <-- La propiedad `lines` es ahora un array simple.
    totalQuantity: 0,
  };
}
// RUTA: components/features/cart/cart-context.tsx
