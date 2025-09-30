// RUTA: src/app/[locale]/(dev)/layout.tsx
/**
 * @file layout.tsx
 * @description Layout de Servidor para el DCC, con un Guardián de Resiliencia Verboso
 *              y la inyección del ScrollingBanner.
 * @version 16.1.0 (Elite Observability & Type Safety)
 * @author L.I.A. Legacy
 */
import React from "react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { DevLayoutClient } from "./(dev)/DevLayoutClient";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { loadAllThemeFragmentsAction } from "@/shared/lib/actions/campaign-suite";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

interface DevLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function DevLayout({ children, params }: DevLayoutProps) {
  const traceId = logger.startTrace("DevLayout_Render_v16.1");
  logger.info(`[Observabilidad][SERVIDOR] Renderizando DevLayout v16.1 para locale: ${params.locale}`, {
    traceId,
  });

  try {
    const { dictionary, error: dictError } = await getDictionary(params.locale);

    // --- INICIO DEL GUARDIÁN DE RESILIENCIA VERBOSO ---
    const requiredKeys: (keyof Dictionary)[] = [
      "devHeader", "toggleTheme", "languageSwitcher", "suiteStyleComposer",
      "userNav", "notificationBell", "devLoginPage", "cookieConsentBanner", "scrollingBanner"
    ];

    if (dictError || requiredKeys.some((key) => !dictionary[key])) {
      const missingKeys = requiredKeys.filter((key) => !dictionary[key]).join(", ");
      const errorMessage = `Faltan claves de i18n críticas en DevLayout. Ausentes: ${missingKeys}`;
      logger.error(`[Guardián de Resiliencia] ${errorMessage}`, { dictError, traceId });
      throw new Error(errorMessage);
    }
    // --- FIN DEL GUARDIÁN DE RESILIENCIA VERBOSO ---

    const fragmentsResult = await loadAllThemeFragmentsAction();
    if (!fragmentsResult.success) {
      const errorMessage = "Fallo al cargar los fragmentos de tema.";
      logger.error(`[Guardián de Resiliencia] ${errorMessage}`, { error: fragmentsResult.error, traceId });
      throw new Error(errorMessage);
    }
    const allLoadedFragments = fragmentsResult.data;
    logger.traceEvent(traceId, "Todos los datos del servidor obtenidos y validados.");

    return (
      <DevLayoutClient
        locale={params.locale}
        dictionary={dictionary as Dictionary}
        allLoadedFragments={allLoadedFragments}
      >
        {children}
      </DevLayoutClient>
    );
  } catch (error) {
    const errorMessage = "Fallo crítico al renderizar el layout del DCC.";
    logger.error(`[DevLayout] ${errorMessage}`, { error, traceId });
    if (process.env.NODE_ENV === "development") {
      return (
        <DeveloperErrorDisplay
          context="DevLayout v16.1"
          errorMessage={errorMessage}
          errorDetails={error instanceof Error ? error : String(error)}
        />
      );
    }
    return notFound();
  } finally {
    logger.endTrace(traceId);
  }
}
