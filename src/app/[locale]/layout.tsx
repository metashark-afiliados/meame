// Ruta correcta: src/app/[locale]/layout.tsx
/**
 * @file layout.tsx
 * @description Layout Localizado, con una arquitectura de datos de comercio
 *              corregida y resiliente, y un contrato de props completo.
 * @version 12.1.0 (Holistic Integrity Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import {
  defaultLocale,
  supportedLocales,
  type Locale,
} from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import AppProviders from "@/components/layout/AppProviders";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeInjector } from "@/components/layout/ThemeInjector";
import { getCart } from "@/shared/lib/commerce/cart";
// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
// La ruta de importación se corrige para apuntar a la SSoT del store en 'shared/lib/stores'.
import { CartProvider } from "@/shared/lib/stores/cart-context";
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---
import { DeveloperErrorDisplay } from "@/components/dev";
import { notFound } from "next/navigation";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale?: Locale };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const safeLocale = supportedLocales.includes(params.locale as Locale)
    ? params.locale!
    : defaultLocale;

  logger.info(`[LocaleLayout] Renderizando v12.1 para locale: [${safeLocale}]`);

  const { dictionary, error: dictError } = await getDictionary(safeLocale);
  const cartPromise = getCart();

  const {
    header,
    footer,
    cookieConsentBanner,
    toggleTheme,
    languageSwitcher,
    cart,
    userNav,
  } = dictionary;

  const essentialContentIsMissing =
    !header ||
    !footer ||
    !cookieConsentBanner ||
    !toggleTheme ||
    !languageSwitcher ||
    !cart ||
    !userNav;

  if (dictError || essentialContentIsMissing) {
    const errorMessage =
      "Fallo al cargar el contenido i18n esencial para el layout principal.";
    logger.error(`[LocaleLayout] ${errorMessage}`, { error: dictError });
    if (process.env.NODE_ENV === "production") return notFound();
    return (
      <html lang={safeLocale}>
        <body>
          <DeveloperErrorDisplay
            context="LocaleLayout"
            errorMessage={errorMessage}
            errorDetails={dictError}
          />
        </body>
      </html>
    );
  }

  return (
    <>
      <ThemeInjector />
      <AppProviders
        locale={safeLocale}
        cookieConsentContent={cookieConsentBanner}
      >
        <CartProvider cartPromise={cartPromise}>
          <Header
            content={header}
            toggleThemeContent={toggleTheme}
            languageSwitcherContent={languageSwitcher}
            cartContent={cart}
            userNavContent={userNav}
            currentLocale={safeLocale}
            supportedLocales={supportedLocales}
          />
          <main>{children}</main>
          <Footer content={footer} />
        </CartProvider>
      </AppProviders>
    </>
  );
}
// Ruta correcta: src/app/[locale]/layout.tsx
