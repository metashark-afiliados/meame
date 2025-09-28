// RUTA: src/shared/lib/actions/cogniread/getCommentsByArticleId.action.ts
/**
 * @file getCommentsByArticleId.action.ts
 * @description Server Action para obtener todos los comentarios de un artículo desde Supabase.
 * @version 2.0.0 (Migración a Supabase)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { z } from "zod";
// Se elimina la importación de MongoDB
// import { connectToDatabase } from "@/shared/lib/mongodb";
import { createServerClient } from "@/shared/lib/supabase/server";
import {
  CommentSchema,
  type Comment,
} from "@/shared/lib/schemas/community/comment.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";

// --- Tipos internos para la respuesta de Supabase (snake_case) ---
// Se reutilizan los tipos definidos en postComment.action.ts para evitar duplicación.
import { mapSupabaseToComment } from "./postComment.action";
interface SupabaseComment {
  id: string; // UUID de Supabase, corresponde a Zod's commentId
  article_id: string;
  user_id: string;
  author_name: string;
  author_avatar_url: string | null;
  comment_text: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}
// --- Fin de tipos internos de Supabase ---


export async function getCommentsByArticleIdAction(
  articleId: string
): Promise<ActionResult<{ comments: Comment[] }>> {
  const traceId = logger.startTrace("getCommentsByArticleIdAction_v2.0_Supabase");
  logger.info(
    `[getCommentsByArticleIdAction] Solicitando comentarios para el artículo: ${articleId} desde Supabase...`,
    { traceId }
  );

  const supabase = createServerClient(); // Obtener el cliente de Supabase

  try {
    // Consulta a Supabase: filtrar por article_id y ordenar por fecha de creación
    const { data, error } = await supabase
      .from("community_comments")
      .select("*") // Seleccionar todas las columnas
      .eq("article_id", articleId)
      .order("created_at", { ascending: true }); // Ordenar del más antiguo al más reciente

    if (error) {
      logger.error("[getCommentsByArticleIdAction] Error al obtener comentarios de Supabase.", {
        articleId,
        error: error.message,
        traceId,
      });
      throw new Error(error.message);
    }

    // Mapear y validar los datos de Supabase a nuestro schema Comment
    const mappedComments: Comment[] = (data || []).map(
      mapSupabaseToComment
    );
    const validation = z.array(CommentSchema).safeParse(mappedComments);

    if (!validation.success) {
      logger.error("[getCommentsByArticleIdAction] Los datos de comentarios de Supabase son inválidos según el esquema de Zod.", {
        articleId,
        errors: validation.error.flatten(),
        traceId,
      });
      throw new Error("Formato de datos de comentarios inesperado desde la base de datos.");
    }
    const validatedComments = validation.data;

    logger.success(
      `[getCommentsByArticleIdAction] Se recuperaron ${validatedComments.length} comentarios para el artículo: ${articleId} desde Supabase.`,
      { traceId }
    );
    return { success: true, data: { comments: validatedComments } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[getCommentsByArticleIdAction] Fallo crítico al obtener comentarios.", {
      error: errorMessage,
      traceId,
    });
    return {
      success: false,
      error: `No se pudieron recuperar los comentarios para este artículo: ${errorMessage}`,
    };
  } finally {
    logger.endTrace(traceId);
  }
}
