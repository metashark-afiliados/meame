// components/sections/CommentSection.tsx
/**
 * @file CommentSection.tsx
 * @description Componente de servidor que ensambla los datos para la sección de comentarios.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { Container, Separator } from "@/components/ui";
import { getCommentsByArticleIdAction } from "@/app/[locale]/(dev)/cogniread/_actions";
import { createClient } from "@/shared/lib/supabase/server";
import { CommentSectionClient } from "./comments/CommentSectionClient";
import { logger } from "@/shared/lib/logging";

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

  const commentsResult = await getCommentsByArticleIdAction(articleId);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-4xl">
        <Separator className="my-8" />
        <h2 className="text-2xl font-bold mb-6">Comentarios</h2>
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
        />
      </Container>
    </section>
  );
}
// components/sections/CommentSection.tsx
