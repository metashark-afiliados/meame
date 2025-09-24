// Ruta correcta: src/components/features/commerce/AddToCartForm.tsx
/**
 * @file AddToCartForm.tsx
 * @description Componente de cliente atómico y de élite que encapsula toda la
 *              lógica para añadir una variante de producto al carrito.
 * @version 1.3.0 (Sovereign Action Import Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState } from "react";
import { useActionState } from "react";
import { Button, DynamicIcon, Input, Label } from "@/components/ui";
import { addItem } from "@/shared/lib/actions/commerce/cart.actions";
import { logger } from "@/shared/lib/logging";

interface AddToCartFormProps {
  isAvailable: boolean;
  variantId: string | undefined;
  content: {
    addToCartButton: string;
    quantityLabel: string;
    outOfStockText: string;
  };
}

export function AddToCartForm({
  isAvailable,
  variantId,
  content,
}: AddToCartFormProps) {
  logger.trace("[AddToCartForm] Renderizando v1.3 (Sovereign Action Import).");
  const [message, formAction] = useActionState(addItem, undefined);
  const [quantity, setQuantity] = useState(1);

  if (!isAvailable) {
    return (
      <Button size="lg" className="w-full sm:w-auto flex-1" disabled>
        {content.outOfStockText}
      </Button>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col sm:flex-row items-center gap-4"
    >
      <input type="hidden" name="variantId" value={variantId} />
      <div className="flex items-center gap-2">
        <Label htmlFor="quantity" className="text-sm font-medium">
          {content.quantityLabel}
        </Label>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            type="button"
            onClick={() => setQuantity((q: number) => Math.max(1, q - 1))}
          >
            <DynamicIcon name="Minus" className="h-4 w-4" />
          </Button>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="h-9 w-16 text-center mx-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            type="button"
            onClick={() => setQuantity((q: number) => q + 1)}
          >
            <DynamicIcon name="Plus" className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto flex-1">
        <DynamicIcon name="ShoppingCart" className="mr-2 h-5 w-5" />
        {content.addToCartButton}
      </Button>

      {message && <p className="text-sm text-red-500 mt-2">{message}</p>}
    </form>
  );
}
// Ruta correcta: src/components/features/commerce/AddToCartForm.tsx
