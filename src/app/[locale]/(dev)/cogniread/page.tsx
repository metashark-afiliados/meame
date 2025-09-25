// RUTA: src/app/[locale]/(dev)/cogniread/page.tsx
/**
 * @file page.tsx
 * @description Página principal del dashboard de CogniRead.
 *              v5.0.0 (Holistic Refactor & API Contract Fix): Se corrige la
 *              invocación a la Server Action y se alinea el componente con
 *              la arquitectura FSD y los 7 Pilares de Calidad.
 * @version 5.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import Link from "next/link";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { notFound } from "next/navigation";
import {
  Container,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  DynamicIcon,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { DeveloperErrorDisplay } from "@/components/dev";
import { getAllArticlesAction } from "@/shared/lib/actions/cogniread";
import { ArticleList } from "@/components/features/cogniread/_components/ArticleList";
import { routes } from "@/shared/lib/navigation";

interface CogniReadDashboardPageProps {
  params: { locale: Locale };
}

export default async function CogniReadDashboardPage({
  params: { locale },
}: CogniReadDashboardPageProps) {
  logger.info(
    `[CogniReadDashboardPage] Renderizando v5.0 (API Contract Fix) para locale: ${locale}`
  );

  // --- [INICIO DE CORRECCIÓN DE CONTRATO DE API] ---
  // Se invoca la acción con el 'input' requerido para paginación.
  const [{ dictionary, error: dictError }, articlesResult] = await Promise.all(
    [getDictionary(locale), getAllArticlesAction({ page: 1, limit: 100 })]
  );
  // --- [FIN DE CORRECCIÓN DE CONTRATO DE API] ---

  const pageContent = dictionary.cogniReadDashboard;

  if (dictError || !pageContent) {
    const errorMessage =
      "Fallo al cargar el contenido i18n para el dashboard de CogniRead.";
    logger.error(`[CogniReadDashboardPage] ${errorMessage}`, {
      error: dictError,
    });
    if (process.env.NODE_ENV === "production") return notFound();
    return (
      <DeveloperErrorDisplay
        context="CogniReadDashboardPage"
        errorMessage={errorMessage}
        errorDetails={
          dictError || "La clave 'cogniReadDashboard' falta en el diccionario."
        }
      />
    );
  }

  if (!articlesResult.success) {
    return (
      <DeveloperErrorDisplay
        context="CogniReadDashboardPage"
        errorMessage="No se pudieron cargar los análisis de estudios."
        errorDetails={articlesResult.error}
      />
    );
  }

  return (
    <>
      <PageHeader content={pageContent.pageHeader} />
      <Container className="py-12">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{pageContent.articleListTitle}</CardTitle>
              <CardDescription>
                {pageContent.articleListDescription}
              </CardDescription>
            </div>
            <Button asChild>
              <Link href={routes.cogniReadEditor.path({ locale })}>
                <DynamicIcon name="Plus" className="mr-2 h-4 w-4" />
                {pageContent.createNewArticleButton}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ArticleList
              articles={articlesResult.data.articles}
              locale={locale}
            />
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
