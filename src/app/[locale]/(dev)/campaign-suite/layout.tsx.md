// RUTA: src/app/[locale]/(dev)/campaign-suite/layout.tsx
/**
 * @file layout.tsx
 * @description Layout Orquestador y "Server Shell" de élite para la SDC. Ahora actúa
 *              como la Única Fuente de Verdad para todos los datos de servidor necesarios
 *              (i18n, fragmentos de tema, manifiesto BAVI), eliminando el doble fetch.
 * @version 10.0.0 (Single Source of Truth Data Fetching)
 * @author L.I.A. Legacy
 */
import React from "react";
import { notFound } from "next/navigation";
import { CampaignSuiteWizard } from "@/components/features/campaign-suite";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { loadAllThemeFragmentsAction } from "@/shared/lib/actions/campaign-suite";
import { getBaviManifest } from "@/shared/lib/bavi";

interface WizardLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function WizardLayout({
  children,
  params: { locale },
}: WizardLayoutProps) {
  const traceId = logger.startTrace("SDC_Layout_DataOrchestrator_v10.0");
  logger.startGroup(`[SDC Layout Shell] Ensamblando datos para [${locale}]...`);

  try {
    // --- GUARDIÁN DE RESILIENCIA Y ORQUESTADOR DE DATOS ---
    logger.traceEvent(traceId, "Obteniendo todos los datos de servidor en paralelo...");
    const [dictionaryResult, fragmentsResult, baviManifestResult] = await Promise.all([
      getDictionary(locale),
      loadAllThemeFragmentsAction(),
      getBaviManifest(), // <-- NUEVA OBTENCIÓN DE DATOS CENTRALIZADA
    ]);
    logger.traceEvent(traceId, "Todas las promesas de datos resueltas.");

    const { dictionary, error: dictError } = dictionaryResult;
    const pageContent = dictionary.campaignSuitePage;

    if (dictError || !pageContent) {
      throw new Error("Fallo al cargar el contenido i18n esencial para la SDC.");
    }
    if (!fragmentsResult.success) {
      throw new Error(`Fallo al cargar los fragmentos de tema: ${fragmentsResult.error}`);
    }
    // El manifiesto BAVI es crítico para la previsualización.
    if (!baviManifestResult) {
      throw new Error("Fallo al cargar el manifiesto BAVI.");
    }
    logger.success("[SDC Layout Shell] Todos los datos de servidor obtenidos y validados.", { traceId });
    // --- FIN DEL GUARDIÁN ---

    return (
      <CampaignSuiteWizard
        content={pageContent}
        loadedFragments={fragmentsResult.data}
        baviManifest={baviManifestResult}
        dictionary={dictionary}
      >
        {children}
      </CampaignSuiteWizard>
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[SDC Layout Shell] Fallo crítico en la obtención de datos.", { error: errorMessage, traceId });
    if (process.env.NODE_ENV === "production") return notFound();
    return (
      <DeveloperErrorDisplay
        context="WizardLayout (Shell de Datos)"
        errorMessage={errorMessage}
        errorDetails={error instanceof Error ? error : undefined}
      />
    );
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}
