// RUTA: src/app/[locale]/(dev)/cogniread/page.tsx
/**
 * @file page.tsx
 * @description Página principal del dashboard de CogniRead.
 * @version 6.0.0 (i18n Contract & API Fix)
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
    `[CogniReadDashboardPage] Renderizando v6.0 (Contract Fix) para locale: ${locale}`
  );

  const [{ dictionary, error: dictError }, articlesResult] = await Promise.all([
    getDictionary(locale),
    getAllArticlesAction({ page: 1, limit: 100 }),
  ]);

  const pageContent = dictionary.cogniReadDashboard;

  if (dictError || !pageContent) {
    // ... (Manejo de error de diccionario)
    if (process.env.NODE_ENV === "production") return notFound();
    return <DeveloperErrorDisplay context="CogniReadDashboardPage" errorMessage="Contenido i18n no encontrado." />;
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
              {/* --- [INICIO DE CORRECCIÓN DE CONTRATO] --- */}
              <CardTitle>{pageContent.articlesListTitle}</CardTitle>
              <CardDescription>{pageContent.articlesListDescription}</CardDescription>
              {/* --- [FIN DE CORRECCIÓN DE CONTRATO] --- */}
            </div>
            <Button asChild>
              <Link href={routes.cogniReadEditor.path({ locale })}>
                <DynamicIcon name="Plus" className="mr-2 h-4 w-4" />
                {pageContent.newArticleButton}
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
