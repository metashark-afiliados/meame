// RUTA: src/app/[locale]/layout.tsx
/**
 * @file layout.tsx
 * @description Layout Localizado. Orquesta la carga de datos, el ensamblaje
 *              de contratos de contenido y la hidratación del estado del cliente.
 * @version 19.0.0 (Type-Safe Contract Assembly)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale, supportedLocales } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCart } from "@/shared/lib/commerce/cart";
import { DeveloperErrorDisplay } from "@/components/dev";
import CartStoreInitializer from "@/shared/lib/stores/CartStoreInitializer";
import type { CartItem as ZustandCartItem } from "@/shared/lib/stores/useCartStore";
import type { CartItem as ShopifyCartItem } from "@/shared/lib/shopify/types";
import { reshapeShopifyProduct } from "@/shared/lib/shopify";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  logger.info(`[LocaleLayout] Renderizando v19.0 para locale: [${locale}]`);

  const [{ dictionary, error }, cartFromShopify] = await Promise.all([
    getDictionary(locale),
    getCart(),
  ]);

  const initialCartItems: ZustandCartItem[] =
    cartFromShopify?.lines.map((line: ShopifyCartItem) => {
      const reshapedProduct = reshapeShopifyProduct(line.merchandise.product);
      return {
        ...reshapedProduct,
        quantity: line.quantity,
      };
    }) || [];

  // --- 1. Validación Atómica de Contenido ---
  const {
    footer,
    header,
    toggleTheme,
    languageSwitcher,
    cart,
    userNav,
    notificationBell,
  } = dictionary;

  // --- 2. Guardia de Contrato Soberana ---
  if (
    error ||
    !footer ||
    !header ||
    !toggleTheme ||
    !languageSwitcher ||
    !cart ||
    !userNav ||
    !notificationBell
  ) {
    const errorMessage =
      "Fallo al cargar contenido i18n esencial para el layout.";
    logger.error(`[LocaleLayout] ${errorMessage}`, { error });
    if (process.env.NODE_ENV === "production") return notFound();
    return (
      <DeveloperErrorDisplay
        context="LocaleLayout"
        errorMessage={errorMessage}
        errorDetails={error || "Faltan claves de contenido esenciales."}
      />
    );
  }

  // --- 3. Ensamblaje Post-Validación ---
  const headerContentBundle = {
    header,
    toggleTheme,
    languageSwitcher,
    cart,
    userNav,
    notificationBell,
  };

  return (
    <>
      <CartStoreInitializer items={initialCartItems} />
      <Header
        content={headerContentBundle}
        currentLocale={locale}
        supportedLocales={supportedLocales}
      />
      <main className="pt-16">{children}</main>
      <Footer content={footer} />
    </>
  );
}
