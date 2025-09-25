// RUTA: src/app/[locale]/layout.tsx
/**
 * @file layout.tsx
 * @description Layout Localizado. Orquesta la carga de datos, la transformación
 *              de contratos y la hidratación del estado del cliente.
 * @version 17.0.0 (Data Transformation & Type Safety)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCart } from "@/shared/lib/commerce/cart";
import { DeveloperErrorDisplay } from "@/components/dev";
import CartStoreInitializer from "@/shared/lib/stores/CartStoreInitializer";
// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: Importación de Tipos] ---
// Se importan los tipos necesarios para la transformación de datos.
import type { CartItem as ZustandCartItem } from "@/shared/lib/stores/useCartStore";
import type { CartItem as ShopifyCartItem } from "@/shared/lib/shopify/types";
import { reshapeShopifyProduct } from "@/shared/lib/shopify";
// --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  logger.info(`[LocaleLayout] Renderizando v17.0 para locale: [${locale}]`);

  const [{ dictionary, error }, cartFromShopify] = await Promise.all([
    getDictionary(locale),
    getCart(),
  ]);

  // --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: Transformación de Datos] ---
  // Se transforma la estructura de datos de la API de Shopify al contrato soberano de nuestro store.
  const initialCartItems: ZustandCartItem[] =
    cartFromShopify?.lines.map((line: ShopifyCartItem) => {
      // `reshapeShopifyProduct` ya transforma el producto a nuestro contrato `Product`.
      const reshapedProduct = reshapeShopifyProduct(line.merchandise.product);
      return {
        ...reshapedProduct, // Spread del producto completo y transformado
        quantity: line.quantity,
      };
    }) || [];
  // --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

  const {
    header,
    footer,
    toggleTheme,
    languageSwitcher,
    cart: cartContent,
    userNav,
    notificationBell,
  } = dictionary;

  if (
    error ||
    !header ||
    !footer ||
    !cartContent ||
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

  return (
    <>
      <CartStoreInitializer items={initialCartItems} />
      <Header
        content={header}
        toggleThemeContent={toggleTheme}
        languageSwitcherContent={languageSwitcher}
        cartContent={cartContent}
        userNavContent={userNav}
        notificationBellContent={notificationBell}
        currentLocale={locale}
        supportedLocales={["es-ES", "it-IT", "en-US", "pt-BR"]}
      />
      <main className="pt-16">{children}</main>
      <Footer content={footer} />
    </>
  );
}
