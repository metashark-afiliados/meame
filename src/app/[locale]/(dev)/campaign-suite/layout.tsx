// Ruta correcta: src/app/[locale]/(dev)/campaign-suite/layout.tsx
/**
 * @file layout.tsx
 * @description Layout de Servidor para la SDC, ahora de calidad de élite.
 *              v7.0.0 (Holistic Restoration & MEA/UX): Resuelve el error de tipo
 *              TS2339 al alinearse con el contrato i18n restaurado. Implementa
 *              una guardia de resiliencia robusta y una animación de entrada
 *              para una experiencia de usuario superior.
 * @version 7.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { WizardClientLayout } from "@/components/features/campaign-suite/_components";
import { DeveloperErrorDisplay } from "@/components/dev";
import { notFound } from "next/navigation";

interface WizardLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function WizardLayout({
  children,
  params,
}: WizardLayoutProps) {
  logger.info(
    `[WizardLayout] Renderizando layout de la SDC (v7.0 - Elite & MEA).`
  );

  const { dictionary, error } = await getDictionary(params.locale);
  const suiteContent = dictionary.campaignSuitePage;

  // --- Pilar VI: Guardia de Resiliencia Robusta ---
  if (error || !suiteContent || !suiteContent.preview) {
    const errorMessage =
      "Fallo al cargar el contenido i18n esencial para la Suite de Diseño.";
    logger.error(`[WizardLayout] ${errorMessage}`, { error });
    if (process.env.NODE_ENV === "production") {
      return notFound();
    }
    return (
      <DeveloperErrorDisplay
        context="WizardLayout"
        errorMessage={errorMessage}
        errorDetails={
          error ||
          "La clave 'campaignSuitePage' o 'preview' falta en el diccionario."
        }
      />
    );
  }

  // --- Pilar I: Se extrae el contenido para la preview de forma segura ---
  const previewContent = {
    loadingTheme: suiteContent.preview.loadingTheme,
    errorLoadingTheme: suiteContent.preview.errorLoadingTheme,
  };

  return (
    <WizardClientLayout previewContent={previewContent}>
      {children}
    </WizardClientLayout>
  );
}
// Ruta correcta: src/app/[locale]/(dev)/campaign-suite/layout.tsx
