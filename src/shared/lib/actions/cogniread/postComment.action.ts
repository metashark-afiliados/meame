// app/[locale]/(dev)/cogniread/_actions/postComment.action.ts
/**
 * @file postComment.action.ts
 * @description Server Action para publicar un nuevo comentario. Incluye una
 *              guardia de seguridad de autenticación no negociable.
 * @version 1.0.1 (Error Crítico de Importación Resuelto)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";
import { connectToDatabase } from "@/shared/lib/mongodb";
import {
  CommentSchema,
  type Comment,
} from "@/shared/lib/schemas/community/comment.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";
// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
// Se ha corregido el nombre de la función importada para que coincida con la exportación real.
import { createServerClient } from "@/shared/lib/supabase/server";
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---

interface PostCommentInput {
  articleId: string;
  commentText: string;
  parentId?: string | null;
  articleSlug: string; // Necesario para revalidar la ruta correcta
}

export async function postCommentAction(
  input: PostCommentInput
): Promise<ActionResult<{ newComment: Comment }>> {
  const traceId = logger.startTrace("postCommentAction");

  // --- GUARDIA DE SEGURIDAD DE AUTENTICACIÓN ---
  const supabase = createServerClient(); // Se utiliza el nombre de la función correcta
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logger.warn(
      "[postCommentAction] Intento de publicar comentario sin autenticación."
    );
    return { success: false, error: "auth_required" }; // Clave de error para la UI
  }

  logger.info(
    `[postCommentAction] Usuario autenticado: ${user.id}. Procediendo...`
  );

  try {
    const now = new Date().toISOString();
    const newCommentId = createId();

    const commentDocument: Comment = {
      commentId: newCommentId,
      articleId: input.articleId,
      userId: user.id,
      // En una implementación real, el nombre y avatar vendrían del perfil del usuario en Supabase.
      authorName: user.email || "Usuario Anónimo",
      authorAvatarUrl: user.user_metadata.avatar_url,
      commentText: input.commentText,
      parentId: input.parentId || null,
      createdAt: now,
      updatedAt: now,
    };

    const validation = CommentSchema.safeParse(commentDocument);
    if (!validation.success) {
      logger.error("[postCommentAction] Fallo de validación de Zod.", {
        error: validation.error.flatten(),
      });
      return {
        success: false,
        error: "Los datos del comentario son inválidos.",
      };
    }

    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection<Comment>("comments");

    const result = await collection.insertOne(validation.data);

    if (!result.acknowledged) {
      throw new Error(
        "La inserción del comentario en la base de datos no fue confirmada."
      );
    }

    // Revalidamos la ruta del artículo para que el nuevo comentario aparezca inmediatamente.
    revalidatePath(`/..*${input.articleSlug}`); // Usamos un patrón para revalidar todos los locales

    logger.success(
      `[postCommentAction] Nuevo comentario creado con ID: ${newCommentId}`
    );
    logger.endTrace(traceId);

    return { success: true, data: { newComment: validation.data } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[postCommentAction] Fallo crítico en la acción.", {
      error: errorMessage,
    });
    logger.endTrace(traceId);
    return { success: false, error: "No se pudo publicar tu comentario." };
  }
}
