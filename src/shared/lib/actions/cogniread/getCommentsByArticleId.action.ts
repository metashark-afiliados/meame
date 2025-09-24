// app/[locale]/(dev)/cogniread/_actions/getCommentsByArticleId.action.ts
/**
 * @file getCommentsByArticleId.action.ts
 * @description Server Action para obtener todos los comentarios de un artículo.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { connectToDatabase } from "@/shared/lib/mongodb";
import { CommentSchema, type Comment } from "@/shared/lib/schemas/community/comment.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";
import { z } from "zod";

export async function getCommentsByArticleIdAction(
  articleId: string
): Promise<ActionResult<{ comments: Comment[] }>> {
  const traceId = logger.startTrace("getCommentsByArticleIdAction");
  try {
    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection("comments");

    const commentsCursor = collection
      .find({ articleId })
      .sort({ createdAt: 1 }); // Ordenar del más antiguo al más reciente

    const commentsArray = await commentsCursor.toArray();

    // Validamos cada comentario recuperado contra el schema
    const validatedComments = z.array(CommentSchema).parse(commentsArray);

    logger.success(
      `[getCommentsByArticleIdAction] Se recuperaron ${validatedComments.length} comentarios para el artículo: ${articleId}`
    );
    logger.endTrace(traceId);

    return { success: true, data: { comments: validatedComments } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[getCommentsByArticleIdAction] Fallo al obtener comentarios.", {
      articleId,
      error: errorMessage,
    });
    logger.endTrace(traceId);
    return {
      success: false,
      error: "No se pudieron recuperar los comentarios para este artículo.",
    };
  }
}
// app/[locale]/(dev)/cogniread/_actions/getCommentsByArticleId.action.ts
