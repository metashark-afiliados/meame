// RUTA: src/app/[locale]/(dev)/dcc/page.tsx
/**
 * @file page.tsx
 * @description "Server Shell" para el dashboard del DCC. Obtiene los datos
 *              y los delega al orquestador de cliente `DevDashboardClient`.
 * @version 12.0.0 (Sovereign Shell Pattern)
 *@author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { DevDashboardClient } from "../_components/DevDashboardClient";

interface DevDashboardPageProps {
  params: { locale: Locale };
}

export default async function DevDashboardPage({
  params: { locale },
}: DevDashboardPageProps) {
  const traceId = logger.startTrace("DevDashboardPage_Shell_v12.0");
  logger.startGroup(
    `[DevDashboardPage Shell] Renderizando v12.0 para locale: ${locale}`
  );

  try {
    const { dictionary, error } = await getDictionary(locale);
    const content = dictionary.devDashboardPage;

    // Guardián de Resiliencia Holístico
    if (error || !content || !content.pageHeader || !content.magicBento) {
      throw new Error(
        "Fallo al cargar el contenido i18n esencial para el DCC, incluyendo 'pageHeader' y 'magicBento'."
      );
    }

    logger.success(
      "[DevDashboardPage Shell] Datos obtenidos y validados con éxito.",
      { traceId }
    );

    return <DevDashboardClient content={content} />;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[DevDashboardPage Shell] Fallo crítico irrecuperable.", {
      error: errorMessage,
      traceId,
    });
    return (
      <DeveloperErrorDisplay
        context="DevDashboardPage (Catch Block)"
        errorMessage="Ocurrió un error inesperado al procesar la página del DCC."
        errorDetails={error instanceof Error ? error : errorMessage}
      />
    );
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}
