// store/useCartStore.ts
/**
 * @file useCartStore.ts
 * @description Hook de Zustand y SSoT para el estado global del carrito de compras.
 *              v2.0.0 (Atomic Refactor): Se extrae la lógica de cálculo de totales
 *              a un hook selector `useCartTotals` para una mejor separación de conceptos.
 * @version 2.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/shared/lib/schemas/entities/product.schema";
import { logger } from "@/shared/lib/logging";

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find((item) => item.id === product.id);

        if (existingItem) {
          logger.info("[CartStore] Actualizando cantidad de item existente.");
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          logger.info("[CartStore] Añadiendo nuevo item al carrito.");
          set({ items: [...items, { ...product, quantity }] });
        }
      },
      removeItem: (productId) => {
        logger.info(`[CartStore] Eliminando item: ${productId}`);
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        logger.info(
          `[CartStore] Actualizando cantidad para ${productId} a ${quantity}.`
        );
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => {
        logger.warn("[CartStore] Vaciando el carrito.");
        set({ items: [] });
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * @hook useCartTotals
 * @description Hook selector atómico para calcular los totales del carrito.
 *              Optimiza el rendimiento al solo re-renderizar componentes
 *              que dependen de los totales cuando los `items` cambian.
 * @returns {{ cartCount: number, cartTotal: number }}
 */
export const useCartTotals = () => {
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  return { cartCount, cartTotal };
};
// store/useCartStore.ts
