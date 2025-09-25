// RUTA: src/app/layout.tsx
/**
 * @file layout.tsx
 * @description Layout Raíz Soberano de la aplicación. SSoT para la estructura
 *              HTML base, la inyección de estilos globales y los proveedores
 *              de contexto del lado del cliente.
 * @version 4.0.0 (Architectural Leveling)
 * @author RaZ Podestá - MetaShark Tech
 */
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { logger } from "@/shared/lib/logging";
import AppProviders from "@/components/layout/AppProviders";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { defaultLocale } from "@/shared/lib/i18n/i18n.config";
import "@/app/globals.css"; // <-- ¡CORRECCIÓN CRÍTICA!

export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getDictionary(defaultLocale);
  return {
    title: dictionary.metadata?.title || "Global Fitwell",
    description: dictionary.metadata?.description || "El futuro del bienestar.",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  logger.info("[RootLayout] Renderizando v4.0 (Architectural Leveling).");

  // Se obtiene el contenido para el banner de cookies aquí, en el servidor.
  const { dictionary } = await getDictionary(defaultLocale);
  const cookieConsentContent = dictionary.cookieConsentBanner;

  return (
    <html
      lang={defaultLocale}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <AppProviders
          locale={defaultLocale}
          cookieConsentContent={cookieConsentContent}
        >
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
