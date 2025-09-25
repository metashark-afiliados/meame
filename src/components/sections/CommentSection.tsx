// RUTA: src/components/sections/CommentSection.tsx
/**
 * @file CommentSection.tsx
 * @description Componente de servidor que ensambla los datos para la sección de comentarios.
 * @version 2.0.0 (FSD Alignment & Elite Compliance)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { Container, Separator } from "@/components/ui";
import { getCommentsByArticleIdAction } from "@/shared/lib/actions/cogniread";
import { createServerClient } from "@/shared/lib/supabase/server";
import { CommentSectionClient } from "./comments/CommentSectionClient";
import { logger } from "@/shared/lib/logging";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { defaultLocale } from "@/shared/lib/i18n/i18n.config";

interface CommentSectionProps {
  articleId: string;
  articleSlug: string;
}

export async function CommentSection({
  articleId,
  articleSlug,
}: CommentSectionProps) {
  logger.info(
    `[CommentSection] Ensamblando datos para el artículo: ${articleId}`
  );

  const [commentsResult, supabase, { dictionary }] = await Promise.all([
    getCommentsByArticleIdAction(articleId),
    createServerClient(),
    getDictionary(defaultLocale), // Asumimos un locale por defecto o lo pasamos como prop.
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const content = dictionary.commentSection;

  if (!content) {
    logger.error("[CommentSection] No se encontró contenido i18n.");
    return null;
  }

  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-4xl">
        <Separator className="my-8" />
        <h2 className="text-2xl font-bold mb-6">{content.title}</h2>
        <CommentSectionClient
          initialComments={
            commentsResult.success ? commentsResult.data.comments : []
          }
          articleId={articleId}
          articleSlug={articleSlug}
          isAuthenticated={!!user}
          currentUser={
            user
              ? { name: user.email!, avatarUrl: user.user_metadata.avatar_url }
              : undefined
          }
          content={content}
          locale={defaultLocale}
        />
      </Container>
    </section>
  );
}
