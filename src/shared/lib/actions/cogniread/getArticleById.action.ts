// app/[locale]/(dev)/cogniread/_actions/getArticleById.action.ts
/**
 * @file getArticleById.action.ts
 * @description Server Action para obtener un único artículo de CogniRead por su CUID2.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { connectToDatabase } from "@/shared/lib/mongodb";
import {
  CogniReadArticleSchema,
  type CogniReadArticle,
} from "@/shared/lib/schemas/cogniread/article.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";

export async function getArticleByIdAction(
  articleId: string
): Promise<ActionResult<{ article: CogniReadArticle | null }>> {
  const traceId = logger.startTrace("getArticleByIdAction");
  try {
    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection("articles");

    const article = await collection.findOne({ articleId });

    if (!article) {
      logger.warn(`[CogniReadAction] No se encontró artículo para el ID: ${articleId}`);
      return { success: true, data: { article: null } };
    }

    const validatedArticle = CogniReadArticleSchema.parse(article);
    logger.success(`[CogniReadAction] Artículo encontrado para el ID: ${articleId}`);
    logger.endTrace(traceId);

    return { success: true, data: { article: validatedArticle } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[CogniReadAction] Fallo al obtener artículo por ID.", {
      error: errorMessage,
    });
    logger.endTrace(traceId);
    return {
      success: false,
      error: "No se pudo recuperar el artículo de la base de datos.",
    };
  }
}
// app/[locale]/(dev)/cogniread/_actions/getArticleById.action.ts
