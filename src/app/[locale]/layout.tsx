// RUTA: src/app/[locale]/layout.tsx
/**
 * @file layout.tsx
 * @description Layout Localizado. Orquesta la carga de datos específicos del
 *              idioma y renderiza los componentes de layout principales.
 * @version 15.0.0 (Atomic Content Propagation)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/shared/lib/stores/cart-context";
import { getCart } from "@/shared/lib/commerce/cart";
import { DeveloperErrorDisplay } from "@/components/dev";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  logger.info(`[LocaleLayout] Renderizando v15.0 para locale: [${locale}]`);

  const { dictionary, error } = await getDictionary(locale);
  const cartPromise = getCart();

  // Desestructuración actualizada para incluir el contenido de notificaciones.
  const {
    header,
    footer,
    toggleTheme,
    languageSwitcher,
    cart,
    userNav,
    notificationBell,
  } = dictionary;

  // La guardia de resiliencia ahora es más robusta y valida el nuevo contenido.
  if (error || !header || !footer || !cart || !userNav || !notificationBell) {
    const errorMessage =
      "Fallo al cargar contenido i18n esencial para el layout localizado.";
    logger.error(`[LocaleLayout] ${errorMessage}`, { error });
    if (process.env.NODE_ENV === "production") return notFound();
    return (
      <DeveloperErrorDisplay
        context="LocaleLayout"
        errorMessage={errorMessage}
        errorDetails={
          error || "Faltan una o más claves de contenido esenciales."
        }
      />
    );
  }

  return (
    <CartProvider cartPromise={cartPromise}>
      <Header
        content={header}
        toggleThemeContent={toggleTheme}
        languageSwitcherContent={languageSwitcher}
        cartContent={cart}
        userNavContent={userNav}
        notificationBellContent={notificationBell} // Se pasa el nuevo prop soberano.
        currentLocale={locale}
        supportedLocales={["es-ES", "it-IT", "en-US", "pt-BR"]}
      />
      <main className="pt-16">{children}</main>
      <Footer content={footer} />
    </CartProvider>
  );
}
// RUTA: src/app/[locale]/layout.tsx
