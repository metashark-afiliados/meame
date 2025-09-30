// RUTA: src/app/[locale]/layout.tsx
/**
 * @file layout.tsx
 * @description Layout Localizado y Guardián de Contexto, ahora con observabilidad de élite.
 * @version 24.1.0 (Elite Observability Injection)
 * @author L.I.A. Legacy
 */
import "server-only";
import React from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale, supportedLocales } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCart } from "@/shared/lib/commerce/cart";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
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
  const traceId = logger.startTrace(`LocaleLayout:${locale}`);
  logger.info(`[Observabilidad][SERVIDOR] Renderizando LocaleLayout v24.1 para locale: [${locale}]`, {
    traceId,
  });

  try {
    const pathname = headers().get("x-next-pathname") || "";
    const isDevRoute =
      pathname.startsWith(`/${locale}/dev`) ||
      pathname.startsWith(`/${locale}/creator`) ||
      pathname.startsWith(`/${locale}/login`);

    logger.traceEvent(traceId, "Análisis de ruta completado.", {
      pathname,
      isDevRoute,
    });

    const [{ dictionary, error }, cartFromShopify] = await Promise.all([
      getDictionary(locale),
      getCart(),
    ]);

    const {
      footer,
      header,
      toggleTheme,
      languageSwitcher,
      cart,
      userNav,
      notificationBell,
      devLoginPage,
    } = dictionary;

    if (
      error || !footer || !header || !toggleTheme || !languageSwitcher ||
      !cart || !userNav || !notificationBell || !devLoginPage
    ) {
      const missingKeys = [
        !footer && "footer", !header && "header", /* ... */
      ].filter(Boolean).join(", ");
      const errorMessage = `Faltan claves de i18n. Ausentes: ${missingKeys}`;
      logger.error(`[Guardián de Resiliencia] ${errorMessage}`, { error, traceId });
      throw new Error(errorMessage);
    }

    const initialCartItems: ZustandCartItem[] =
      cartFromShopify?.lines.map((line: ShopifyCartItem) => {
        const reshapedProduct = reshapeShopifyProduct(line.merchandise.product);
        return { ...reshapedProduct, quantity: line.quantity };
      }) || [];

    const headerContentBundle = {
      header, toggleTheme, languageSwitcher, cart, userNav, notificationBell, devLoginPage,
    };

    return (
      <>
        <CartStoreInitializer items={initialCartItems} />
        {!isDevRoute && (
          <Header
            content={headerContentBundle}
            currentLocale={locale}
            supportedLocales={supportedLocales}
          />
        )}
        <main className={!isDevRoute ? "pt-16" : ""}>{children}</main>
        {!isDevRoute && <Footer content={footer} />}
      </>
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido.";
    logger.error(`[LocaleLayout] Fallo crítico.`, { error: errorMessage, traceId });
    if (process.env.NODE_ENV === "development") {
      return (
        <DeveloperErrorDisplay
          context="LocaleLayout v24.1"
          errorMessage="No se pudieron obtener los datos esenciales para el layout."
          errorDetails={error instanceof Error ? error : errorMessage}
        />
      );
    }
    return notFound();
  } finally {
    logger.endTrace(traceId);
  }
}
