// app/[locale]/(dev)/cogniread/editor/page.tsx
/**
 * @file page.tsx
 * @description Página "Shell" de servidor para el editor de artículos de CogniRead.
 * @version 3.0.0 (Full i18n Compliance)
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
import { getDictionary } from "@/shared/lib/i18n/i18n"; // Importar getDictionary
import { notFound } from "next/navigation";

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
    `[ArticleEditorPage] Renderizando. Modo: ${isEditing ? `Edición (ID: ${id})` : "Creación"} para locale: ${locale}`
  );

  const [{ dictionary, error: dictError }, articleResult] = await Promise.all([
    getDictionary(locale),
    isEditing ? getArticleByIdAction(id) : Promise.resolve({ success: true, data: { article: null } }),
  ]);

  const pageContent = dictionary.cogniReadEditor;

  if (dictError || !pageContent) {
    const errorMessage = "Fallo al cargar el contenido i18n esencial para el editor de CogniRead.";
    logger.error(`[ArticleEditorPage] ${errorMessage}`, { error: dictError });
    if (process.env.NODE_ENV === "production") {
      return notFound();
    }
    return (
      <DeveloperErrorDisplay
        context="ArticleEditorPage"
        errorMessage={errorMessage}
        errorDetails={dictError || "La clave 'cogniReadEditor' falta en el diccionario."}
      />
    );
  }

  let initialArticleData: CogniReadArticle | null = null;
  let fetchError: string | null = null;

  if (isEditing) {
    if (articleResult.success) {
      initialArticleData = articleResult.data.article;
      if (!initialArticleData) {
        fetchError = pageContent.pageHeader.editSubtitle; // Usar i18n para error
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
            ? pageContent.pageHeader.editTitle
            : pageContent.pageHeader.createTitle,
          subtitle: isEditing
            ? pageContent.pageHeader.editSubtitle
            : pageContent.pageHeader.createSubtitle,
        }}
      />
      <Container className="py-12">
        {fetchError ? (
          <DeveloperErrorDisplay
            context="ArticleEditorPage"
            errorMessage={fetchError}
            errorDetails={id ? `Artículo ID: ${id} no encontrado.` : null}
          />
        ) : (
          <ArticleEditorClient initialData={initialArticleData} content={pageContent} /> {/* Pasar content */}
        )}
      </Container>
    </>
  );
}
