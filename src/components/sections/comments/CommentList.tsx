// RUTA: src/components/sections/comments/CommentList.tsx
/**
 * @file CommentList.tsx
 * @description Componente de presentación para renderizar una lista de comentarios con animación.
 * @version 2.0.0 (Holistic Elite Leveling & MEA/UX)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { DynamicIcon } from "@/components/ui";
import type { Comment } from "@/shared/lib/schemas/community/comment.schema";
import { logger } from "@/shared/lib/logging";
import type { CommentSectionContent } from "@/shared/lib/schemas/components/comment-section.schema";

interface CommentListProps {
  comments: Comment[];
  content: Pick<CommentSectionContent, "emptyState">;
}

export function CommentList({ comments, content }: CommentListProps) {
  logger.trace("[CommentList] Renderizando v2.0 (Elite & MEA).");

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{content.emptyState}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {comments.map((comment) => (
          <motion.div
            key={comment.commentId}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-start space-x-4"
          >
            <Avatar>
              <AvatarImage src={comment.authorAvatarUrl ?? undefined} />
              <AvatarFallback>
                <DynamicIcon name="User" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-semibold text-foreground">{comment.authorName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                {comment.commentText}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
