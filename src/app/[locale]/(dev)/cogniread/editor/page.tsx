// app/[locale]/(dev)/cogniread/editor/page.tsx
/**
 * @file page.tsx
 * @description Página "Shell" de servidor para el editor de artículos de CogniRead.
 * @version 2.0.0 (Context-Aware Data Loading)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { Container } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { getArticleByIdAction } from "../_actions";
import { ArticleEditorClient } from "./_components/ArticleEditorClient";
import { DeveloperErrorDisplay } from "@/components/dev";
import type { CogniReadArticle } from "@/shared/lib/schemas/cogniread/article.schema";

interface ArticleEditorPageProps {
  params: { locale: Locale };
  searchParams: { id?: string };
}

export default async function ArticleEditorPage({
  params: { locale },
  searchParams,
}: ArticleEditorPageProps) {
  const { id } = searchParams;
  const isEditing = !!id;

  logger.info(
    `[ArticleEditorPage] Renderizando. Modo: ${isEditing ? `Edición (ID: ${id})` : "Creación"}`
  );

  let initialArticleData: CogniReadArticle | null = null;
  let fetchError: string | null = null;

  if (isEditing) {
    const articleResult = await getArticleByIdAction(id);
    if (articleResult.success) {
      initialArticleData = articleResult.data.article;
      if (!initialArticleData) {
        fetchError = "El artículo solicitado para edición no fue encontrado.";
      }
    } else {
      fetchError = articleResult.error;
    }
  }

  return (
    <>
      <PageHeader
        content={{
          title: isEditing
            ? "Editando Análisis de Estudio"
            : "Nuevo Análisis de Estudio",
          subtitle:
            "Rellena el ADN del estudio científico para registrarlo en CogniRead.",
        }}
      />
      <Container className="py-12">
        {fetchError ? (
          <DeveloperErrorDisplay
            context="ArticleEditorPage"
            errorMessage={fetchError}
          />
        ) : (
          <ArticleEditorClient initialData={initialArticleData} />
        )}
      </Container>
    </>
  );
}
// app/[locale]/(dev)/cogniread/editor/page.tsx
