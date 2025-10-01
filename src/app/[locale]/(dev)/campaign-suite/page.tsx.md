// RUTA: src/app/[locale]/(dev)/campaign-suite/page.tsx
/**
 * @file page.tsx
 * @description Página de entrada única (SPA) para la SDC.
 * @version 12.0.0 (Server Action Data Fetching & Decoupling)
 * @author RaZ Podestá - MetaShark Tech
 */
import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { logger } from "@/shared/lib/logging";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { StepClientWrapper } from "@/components/features/campaign-suite/_components";
import { stepsConfig } from "@/shared/lib/config/campaign-suite/wizard.config";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";

interface CreatePageProps {
  params: { locale: Locale };
  searchParams: { step?: string };
}

export default async function CreatePage({
  params: { locale },
  searchParams,
}: CreatePageProps) {
  const currentStepId = parseInt(searchParams?.step || "0", 10);
  const stepConfig = stepsConfig.find((s) => s.id === currentStepId);

  if (!stepConfig) {
    logger.error(
      `[CreatePage] Configuración no encontrada para el paso ${currentStepId}. Redirigiendo a 404.`
    );
    return notFound();
  }

  logger.info(
    `[CreatePage] Renderizando. Locale: [${locale}], Paso: [${currentStepId}]`
  );

  // La lógica de `fs` ha sido eliminada. Ahora obtenemos el diccionario completo.
  const { dictionary, error } = await getDictionary(locale);

  // Extraemos la clave de contenido específica para el paso actual.
  const stepContent = dictionary[stepConfig.i18nKey];

  if (error || !stepContent) {
    const errorMessage = `No se pudo cargar o validar el contenido para el paso ${currentStepId}.`;
    logger.error(`[CreatePage] ${errorMessage}`, { error });
    return (
      <DeveloperErrorDisplay
        context="CreatePage"
        errorMessage={errorMessage}
        errorDetails={
          error ||
          `La clave i18n '${stepConfig.i18nKey}' falta en el diccionario.`
        }
      />
    );
  }

  return (
    <Suspense fallback={<div>Cargando asistente...</div>}>
      <StepClientWrapper stepContent={stepContent} />
    </Suspense>
  );
}
