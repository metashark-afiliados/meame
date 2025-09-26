// RUTA: src/components/sections/comments/CommentSectionClient.tsx
/**
 * @file CommentSectionClient.tsx
 * @description Componente "cerebro" para la sección de comentarios interactiva.
 * @version 2.1.0 (Correct Data Flow)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Comment } from "@/shared/lib/schemas/community/comment.schema";
import { CommentList } from "./CommentList";
import { CommentForm } from "./CommentForm";
import { postCommentAction } from "@/shared/lib/actions/cogniread";
import { logger } from "@/shared/lib/logging";
import type { CommentSectionContent } from "@/shared/lib/schemas/components/comment-section.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";

interface CommentSectionClientProps {
  initialComments: Comment[];
  articleId: string;
  articleSlug: string;
  isAuthenticated: boolean;
  currentUser?: {
    name: string;
    avatarUrl?: string | null;
  };
  content: CommentSectionContent;
  locale: Locale;
}

export function CommentSectionClient({
  initialComments,
  articleId,
  articleSlug,
  isAuthenticated,
  currentUser,
  content,
  locale,
}: CommentSectionClientProps) {
  logger.info("[CommentSectionClient] Renderizando v2.1 (Correct Data Flow).");

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
        toast.success(content.toast.success);
        setComments((prev) => [...prev, result.data.newComment]);
      } else {
        toast.error(content.toast.errorTitle, {
          description:
            result.error === "auth_required"
              ? content.toast.authError
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
        content={content.form}
        locale={locale}
      />
      <CommentList comments={comments} content={content.list} />
    </div>
  );
}
