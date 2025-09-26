// RUTA: src/app/[locale]/(dev)/cogniread/editor/page.tsx
/**
 * @file page.tsx
 * @description Página "Shell" de servidor para el editor de artículos de CogniRead.
 *              v4.0.0 (Holistic & i18n Data Fetching): Orquesta la obtención de
 *              todos los datos de servidor (artículo y diccionario) y los
 *              pasa de forma segura a su componente de cliente.
 * @version 4.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import type { CogniReadArticle } from "@/shared/lib/schemas/cogniread/article.schema";
import { getArticleByIdAction } from "@/shared/lib/actions/cogniread";
import { ArticleEditorClient } from "@/components/features/cogniread/editor/ArticleEditorClient";

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
    `[ArticleEditorPage] Renderizando v4.0. Modo: ${isEditing ? `Edición (ID: ${id})` : "Creación"}`
  );

  // --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: OBTENCIÓN DE DATOS SECUENCIAL Y RESILIENTE] ---
  // 1. Obtener el diccionario, que siempre es necesario.
  const { dictionary, error: dictError } = await getDictionary(locale);
  const pageContent = dictionary.cogniReadEditor;

  // 2. Guardia de Resiliencia para el contenido i18n.
  if (dictError || !pageContent) {
    const errorMessage =
      "Fallo al cargar el contenido i18n para el editor de CogniRead.";
    logger.error(`[ArticleEditorPage] ${errorMessage}`, { error: dictError });
    if (process.env.NODE_ENV === "production") return notFound();
    return (
      <DeveloperErrorDisplay
        context="ArticleEditorPage"
        errorMessage={errorMessage}
        errorDetails={
          dictError || "La clave 'cogniReadEditor' falta en el diccionario."
        }
      />
    );
  }

  // 3. Obtener los datos del artículo SOLO si estamos en modo de edición.
  let initialArticleData: CogniReadArticle | null = null;
  let fetchError: string | null = null;

  if (isEditing) {
    const articleResult = await getArticleByIdAction(id);
    if (articleResult.success) {
      initialArticleData = articleResult.data.article;
      if (!initialArticleData) {
        // Si la acción fue exitosa pero no se encontró el artículo, establecemos un error amigable.
        fetchError =
          pageContent.articleNotFoundError || "Artículo no encontrado.";
      }
    } else {
      // Si la acción falló, TypeScript ahora sabe que `articleResult` es de tipo `ErrorResult`.
      // El acceso a `articleResult.error` es 100% seguro.
      fetchError = articleResult.error;
    }
  }
  // --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

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
          />
        ) : (
          <ArticleEditorClient
            initialData={initialArticleData}
            content={pageContent}
          />
        )}
      </Container>
    </>
  );
}
