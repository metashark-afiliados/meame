// RUTA: src/app/[locale]/(dev)/page.tsx
/**
 * @file page.tsx
 * @description Punto de entrada soberano y "Server Shell" para el Developer Command Center.
 *              v1.0.0 (Architectural Unification): Unifica la lógica del dashboard del DCC
 *              en la ruta raíz /dev, eliminando la redundancia de /dev/dcc. Inyectado con
 *              observabilidad de élite y un guardián de resiliencia holístico.
 * @version 1.0.0
 * @author L.I.A. Legacy
 */
import React from "react";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { DevDashboardClient } from "./_components/DevDashboardClient";

interface DevDashboardPageProps {
  params: { locale: Locale };
}

export default async function DevDashboardPage({
  params: { locale },
}: DevDashboardPageProps) {
  const traceId = logger.startTrace("DCC_Dashboard_Shell_v1.0");
  logger.startGroup(
    `[DCC Shell] Renderizando dashboard para locale: ${locale}`
  );

  try {
    logger.traceEvent(traceId, "Iniciando obtención de diccionario i18n...");
    const { dictionary, error } = await getDictionary(locale);
    const content = dictionary.devDashboardPage;
    logger.traceEvent(traceId, "Obtención de diccionario completada.");

    // --- [INICIO] GUARDIÁN DE RESILIENCIA HOLÍSTICO ---
    if (error || !content || !content.pageHeader || !content.magicBento) {
      const missingKeys = [
        !content && "devDashboardPage",
        !content?.pageHeader && "pageHeader",
        !content?.magicBento && "magicBento",
      ]
        .filter(Boolean)
        .join(", ");

      // Lanza un error específico y detallado para una depuración instantánea.
      throw new Error(
        `Fallo al cargar el contenido i18n esencial para el DCC. Claves ausentes: ${missingKeys}`
      );
    }
    // --- [FIN] GUARDIÁN DE RESILIENCIA HOLÍSTICO ---

    logger.success(
      "[DCC Shell] Datos obtenidos y validados. Delegando a DevDashboardClient...",
      { traceId }
    );

    return <DevDashboardClient content={content} />;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "[DCC Shell] Fallo crítico irrecuperable en el Server Shell.",
      {
        error: errorMessage,
        traceId,
      }
    );
    return (
      <DeveloperErrorDisplay
        context="DevDashboardPage (Server Shell)"
        errorMessage="Ocurrió un error inesperado al ensamblar el dashboard del DCC."
        errorDetails={error instanceof Error ? error : errorMessage}
      />
    );
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}
