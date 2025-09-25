// RUTA: src/shared/lib/stores/CartStoreInitializer.tsx
/**
 * @file CartStoreInitializer.tsx
 * @description Componente de cliente atómico para inicializar el estado del useCartStore.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useRef } from "react";
import { useCartStore, type CartItem } from "./useCartStore";
import { logger } from "@/shared/lib/logging";

interface CartStoreInitializerProps {
  items: CartItem[];
}

function CartStoreInitializer({ items }: CartStoreInitializerProps) {
  const initialized = useRef(false);
  if (!initialized.current) {
    useCartStore.getState().initialize(items);
    initialized.current = true;
    logger.info("[CartStore] Estado inicial hidratado desde el servidor.", {
      itemCount: items.length,
    });
  }
  return null;
}

export default CartStoreInitializer;
