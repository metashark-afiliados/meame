// components/sections/comments/CommentSectionClient.tsx
/**
 * @file CommentSectionClient.tsx
 * @description Componente "cerebro" para la sección de comentarios interactiva.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Comment } from "@/shared/lib/schemas/community/comment.schema";
import { CommentList } from "./CommentList";
import { CommentForm } from "./CommentForm";
import { postCommentAction } from "@/app/[locale]/(dev)/cogniread/_actions";
import { logger } from "@/shared/lib/logging";

interface CommentSectionClientProps {
  initialComments: Comment[];
  articleId: string;
  articleSlug: string;
  isAuthenticated: boolean;
  currentUser?: {
    name: string;
    avatarUrl?: string | null;
  };
}

export function CommentSectionClient({
  initialComments,
  articleId,
  articleSlug,
  isAuthenticated,
  currentUser,
}: CommentSectionClientProps) {
  logger.info("[CommentSectionClient] Renderizando.");

  const [comments, setComments] = useState(initialComments);
  const [isPending, startTransition] = useTransition();

  const handlePostComment = (data: { commentText: string }) => {
    startTransition(async () => {
      const result = await postCommentAction({
        articleId,
        articleSlug,
        commentText: data.commentText,
      });

      if (result.success) {
        toast.success("Comentario publicado con éxito.");
        setComments((prev) => [...prev, result.data.newComment]);
      } else {
        toast.error("Error al publicar", {
          description:
            result.error === "auth_required"
              ? "Debes iniciar sesión para comentar."
              : result.error,
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      <CommentForm
        isAuthenticated={isAuthenticated}
        userAvatarUrl={currentUser?.avatarUrl}
        userName={currentUser?.name}
        onSubmit={handlePostComment}
        isPending={isPending}
      />
      <CommentList comments={comments} />
    </div>
  );
}
// components/sections/comments/CommentSectionClient.tsx
