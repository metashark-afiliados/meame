// Ruta correcta: src/components/layout/CartSheet.tsx
/**
 * @file CartSheet.tsx
 * @description Panel lateral (Sheet) de élite para el carrito de compras.
 *              v4.1.0 (Holistic Type & Path Restoration): Se corrigen todas las
 *              rutas de importación y se aplican tipos explícitos para resolver
 *              errores de build.
 * @version 4.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import {
  useCartStore,
  useCartTotals,
  type CartItem,
} from "@/shared/lib/stores/useCartStore";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";

type CartContent = NonNullable<Dictionary["cart"]>;

interface CartSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  content: CartContent;
  locale: Locale;
}

const CartItemRow = ({ item, locale }: { item: CartItem; locale: Locale }) => {
  const { updateQuantity, removeItem } = useCartStore();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex items-center gap-4 py-4"
    >
      <div className="relative h-16 w-16 rounded-md overflow-hidden border">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-contain"
          sizes="64px"
        />
      </div>
      <div className="flex-1 space-y-1">
        <h4 className="text-sm font-semibold">{item.name}</h4>
        <p className="text-sm text-muted-foreground">
          {new Intl.NumberFormat(locale, {
            style: "currency",
            currency: item.currency,
          }).format(item.price)}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            aria-label={`Reducir cantidad de ${item.name}`}
          >
            <DynamicIcon name="Minus" className="h-4 w-4" />
          </Button>
          <span className="text-sm w-4 text-center" aria-live="polite">
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            aria-label={`Aumentar cantidad de ${item.name}`}
          >
            <DynamicIcon name="Plus" className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        onClick={() => removeItem(item.id)}
        aria-label={`Eliminar ${item.name} del carrito`}
      >
        <DynamicIcon name="Trash2" className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};

export function CartSheet({
  isOpen,
  onOpenChange,
  content,
  locale,
}: CartSheetProps) {
  logger.info("[CartSheet] Renderizando v4.1 (Holistic Restoration).");
  const items = useCartStore((state: { items: CartItem[] }) => state.items);
  const { cartTotal } = useCartTotals();
  const router = useRouter();

  const handleStartShopping = () => {
    onOpenChange(false);
    router.push(`/${locale}/store`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>{content.sheetTitle}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6">
          <div className="divide-y">
            <AnimatePresence>
              {items.length > 0 ? (
                items.map((item: CartItem) => (
                  <CartItemRow key={item.id} item={item} locale={locale} />
                ))
              ) : (
                <motion.div
                  key="empty-cart"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-1 flex-col items-center justify-center gap-4 text-center py-20"
                >
                  <DynamicIcon
                    name="ShoppingCart"
                    className="w-16 h-16 text-muted-foreground/30"
                    aria-hidden="true"
                  />
                  <p className="text-muted-foreground">
                    {content.emptyStateText}
                  </p>
                  <Button onClick={handleStartShopping}>
                    {content.emptyStateButton}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {items.length > 0 && (
          <SheetFooter className="px-6 py-4 bg-muted/50 mt-auto">
            <div className="w-full space-y-4">
              <div className="flex justify-between text-base font-semibold">
                <p>{content.subtotalLabel}</p>
                <p>
                  {new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: "EUR",
                  }).format(cartTotal)}
                </p>
              </div>
              <Button size="lg" className="w-full">
                {content.checkoutButton}
              </Button>
              <SheetClose asChild>
                <Button variant="link" className="w-full">
                  {content.continueShoppingButton}
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
