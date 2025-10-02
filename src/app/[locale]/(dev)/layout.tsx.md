// RUTA: src/app/[locale]/(dev)/layout.tsx
/\*\*

- @file layout.tsx
- @description Layout Raíz del Developer Command Center (DCC).
- @version 7.0.0 (Sovereign Root & Holistic Fix)
  _@author RaZ Podestá - MetaShark Tech
  _/
  import "server-only";
  import React from "react";
  import { GeistSans } from "geist/font/sans";
  import { GeistMono } from "geist/font/mono";
  import { Toaster } from "sonner";
  import AppProviders from "@/components/layout/AppProviders";
  import Header from "@/components/layout/Header";
  import { DevThemeSwitcher } from "@/components/features/dev-tools/DevThemeSwitcher";
  import { WizardHeader } from "@/components/features/campaign-suite/\_components/WizardHeader";
  import { loadAllThemeFragmentsAction } from "@/shared/lib/actions/campaign-suite";
  import { getDictionary } from "@/shared/lib/i18n/i18n";
  import { logger } from "@/shared/lib/logging";
  import { DeveloperErrorDisplay } from "@/components/features/dev-tools";
  import type { Locale } from "@/shared/lib/i18n/i18n.config";
  import { headers } from "next/headers";
  import { cn } from "@/shared/lib/utils";
  import "../../globals.css"; // Ajusta la ruta de importación de CSS

interface DevLayoutProps {
children: React.ReactNode;
params: { locale: Locale };
}

export default async function DevLayout({
children,
params: { locale },
}: DevLayoutProps) {
const traceId = logger.startTrace(`DevLayout_Render_v7.0:${locale}`);
logger.startGroup(`[DevLayout] Ensamblando UI del DCC para [${locale}]...`);

const headersList = headers();
const pathname = headersList.get("x-next-pathname") || "";

try {
const [dictionaryResult, fragmentsResult] = await Promise.all([
getDictionary(locale),
loadAllThemeFragmentsAction(),
]);

    const { dictionary, error } = dictionaryResult;
    const {
      devHeader,
      toggleTheme,
      languageSwitcher,
      userNav,
      notificationBell,
      devLoginPage,
      suiteStyleComposer,
      cart,
    } = dictionary;

    if (
      error ||
      !devHeader ||
      !toggleTheme ||
      !languageSwitcher ||
      !userNav ||
      !notificationBell ||
      !devLoginPage ||
      !suiteStyleComposer ||
      !cart
    ) {
      throw new Error(
        "Contenido i18n esencial para el layout del DCC está ausente."
      );
    }
    if (!fragmentsResult.success) {
      throw new Error(
        `No se pudieron cargar los fragmentos de tema: ${fragmentsResult.error}`
      );
    }

    const headerContent = {
      header: {
        logoUrl: devHeader.logoUrl,
        logoAlt: devHeader.logoAlt,
        navLinks: [],
        signUpButton: { label: "" },
      },
      toggleTheme,
      languageSwitcher,
      userNav,
      notificationBell,
      devLoginPage,
      cart,
    };

    const isCampaignSuite = pathname.includes("/creator/campaign-suite");

    return (
      <html lang={locale} suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            GeistSans.variable,
            GeistMono.variable
          )}
        >
          <AppProviders
            locale={locale}
            cookieConsentContent={dictionary.cookieConsentBanner}
          >
            <Header
              content={headerContent}
              currentLocale={locale}
              supportedLocales={["es-ES", "it-IT", "en-US", "pt-BR"]}
              centerComponent={isCampaignSuite ? <WizardHeader /> : undefined}
              rightComponent={
                <DevThemeSwitcher
                  allThemeFragments={fragmentsResult.data}
                  content={suiteStyleComposer}
                />
              }
            />
            <main>{children}</main>
            <Toaster richColors position="top-right" />
          </AppProviders>
        </body>
      </html>
    );

} catch (error) {
const errorMessage =
error instanceof Error ? error.message : "Error desconocido.";
logger.error("[DevLayout] Fallo crítico al renderizar el layout del DCC.", {
error: errorMessage,
traceId,
});
return (

<html lang={locale}>
<body>
<DeveloperErrorDisplay
context="DevLayout"
errorMessage="No se pudo construir el layout del Developer Command Center."
errorDetails={error instanceof Error ? error : errorMessage}
/>
</body>
</html>
);
} finally {
logger.endGroup();
logger.endTrace(traceId);
}
}
