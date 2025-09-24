// RUTA: app/[locale]/(dev)/nos3/page.tsx
/**
 * @file page.tsx
 * @description Página de índice para el explorador de sesiones de `Nos3`, ahora internacionalizada.
 * @version 2.0.0 (Full i18n Compliance)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Card, CardContent } from "@/components/ui";
import { DeveloperErrorDisplay } from "@/components/dev";
import { logger } from "@/shared/lib/logging";
import { listSessionsAction } from "./_actions/list-sessions.action";
import { SessionListClient } from "./_components";
import { getDictionary } from "@/shared/lib/i18n/i18n"; // Importar getDictionary
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { notFound } from "next/navigation";

interface Nos3ListPageProps {
  params: { locale: Locale };
}

export default async function Nos3ListPage({
  params: { locale },
}: Nos3ListPageProps) {
  logger.info(
    "[Nos3ListPage] Renderizando página de índice de sesiones v2.0 (Full i18n)."
  );

  const [{ dictionary, error: dictError }, sessionsResult] = await Promise.all([
    getDictionary(locale),
    listSessionsAction(),
  ]);

  const pageContent = dictionary.nos3Dashboard;

  if (dictError || !pageContent) {
    const errorMessage =
      "Fallo al cargar el contenido i18n esencial para el dashboard de Nos3.";
    logger.error(`[Nos3ListPage] ${errorMessage}`, { error: dictError });
    if (process.env.NODE_ENV === "production") {
      return notFound();
    }
    return (
      <DeveloperErrorDisplay
        context="Nos3ListPage"
        errorMessage={errorMessage}
        errorDetails={
          dictError || "La clave 'nos3Dashboard' falta en el diccionario."
        }
      />
    );
  }

  if (!sessionsResult.success) {
    return (
      <DeveloperErrorDisplay
        context="Nos3ListPage"
        errorMessage="No se pudieron cargar las sesiones de Nos3."
        errorDetails={sessionsResult.error}
      />
    );
  }

  return (
    <>
      <PageHeader content={pageContent.pageHeader} /> {/* Consume i18n */}
      <Container className="py-8">
        <Card>
          <CardContent className="pt-6">
            <SessionListClient
              sessions={sessionsResult.data}
              content={{
                tableHeaders: pageContent.tableHeaders,
                reproduceButton: pageContent.reproduceButton,
                emptyStateTitle: pageContent.emptyStateTitle,
                emptyStateDescription: pageContent.emptyStateDescription,
              }}
              locale={locale} // Pasar locale para formato de fecha
            />
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
