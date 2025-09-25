// RUTA: src/app/[locale]/(dev)/dev/page.tsx
/**
 * @file page.tsx
 * @description Server Component "Shell" para la página de inicio del DCC.
 *              Obtiene datos y los delega al componente de cliente.
 * @version 9.0.0 (Server Shell Pattern Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/dev";
import { DevDashboardClient } from "./_components/DevDashboardClient";

interface DevDashboardPageProps {
  params: { locale: Locale };
}

export default async function DevDashboardPage({
  params: { locale },
}: DevDashboardPageProps) {
  logger.info(`[DevDashboardPage Shell] Obteniendo datos para locale: ${locale}`);

  const { dictionary, error } = await getDictionary(locale);
  const content = dictionary.devDashboardPage;

  if (error || !content) {
    const errorMessage = "Fallo al cargar el contenido i18n para el DCC.";
    logger.error(`[DevDashboardPage Shell] ${errorMessage}`, { error });
    if (process.env.NODE_ENV === "production") return notFound();
    return (
      <DeveloperErrorDisplay
        context="DevDashboardPage"
        errorMessage={errorMessage}
        errorDetails={
          error || "La clave 'devDashboardPage' falta en el diccionario."
        }
      />
    );
  }

  return <DevDashboardClient content={content} locale={locale} />;
}
