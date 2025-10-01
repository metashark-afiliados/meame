// RUTA: src/app/[locale]/(public)/layout.tsx
/**
 * @file layout.tsx
 * @description Layout para el grupo de rutas públicas, ahora con un Guardián de
 *              Resiliencia holístico que garantiza la integridad del contrato de datos.
 * @version 2.0.0 (Holistic Resilience Guardian)
 *@author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import React from "react";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";

interface PublicLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function PublicLayout({
  children,
  params: { locale },
}: PublicLayoutProps) {
  const traceId = logger.startTrace(`PublicLayout_Render_v2.0:${locale}`);
  logger.startGroup(`[PublicLayout] Ensamblando UI para [${locale}]...`);

  try {
    const { dictionary, error } = await getDictionary(locale);

    // --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: GUARDIÁN DE RESILIENCIA HOLÍSTICO] ---
    const {
      header,
      toggleTheme,
      languageSwitcher,
      userNav,
      notificationBell,
      devLoginPage,
      cart,
      footer,
    } = dictionary;

    // El guardián ahora valida TODAS las claves de contenido requeridas por el Header y el Footer.
    if (
      error ||
      !header ||
      !footer ||
      !languageSwitcher ||
      !cart ||
      !userNav ||
      !toggleTheme || // <-- Validación añadida
      !notificationBell || // <-- Validación añadida
      !devLoginPage // <-- Validación añadida (requerida por UserNavClient)
    ) {
      const missingKeys = [
        !header && "header",
        !footer && "footer",
        !languageSwitcher && "languageSwitcher",
        !cart && "cart",
        !userNav && "userNav",
        !toggleTheme && "toggleTheme",
        !notificationBell && "notificationBell",
        !devLoginPage && "devLoginPage",
      ]
        .filter(Boolean)
        .join(", ");

      throw new Error(
        `Faltan datos de i18n esenciales para el layout público. Claves ausentes: ${missingKeys}`
      );
    }

    // A partir de este punto, TypeScript sabe que ninguna de estas propiedades es undefined.
    const headerContent = {
      header,
      toggleTheme,
      languageSwitcher,
      userNav,
      notificationBell,
      devLoginPage,
      cart,
    };
    // --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

    return (
      <>
        <Header
          content={headerContent}
          currentLocale={locale}
          supportedLocales={["es-ES", "it-IT", "en-US", "pt-BR"]}
        />
        <main>{children}</main>
        <Footer content={footer} />
      </>
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[PublicLayout] Fallo crítico al renderizar.", {
      error: errorMessage,
      traceId,
    });

    if (process.env.NODE_ENV === "development") {
      return (
        <DeveloperErrorDisplay
          context="PublicLayout"
          errorMessage="No se pudo construir el layout público."
          errorDetails={error instanceof Error ? error : errorMessage}
        />
      );
    }
    return <>{children}</>;
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}
