// RUTA: src/shared/lib/actions/cogniread/getArticlesByIds.action.ts
/**
 * @file getArticlesByIds.action.ts
 * @description Server Action para obtener un lote de artículos de CogniRead por sus IDs.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { z } from "zod";
import { connectToDatabase } from "@/shared/lib/mongodb";
import {
  CogniReadArticleSchema,
  type CogniReadArticle,
} from "@/shared/lib/schemas/cogniread/article.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";

export async function getArticlesByIdsAction(
  articleIds: string[]
): Promise<ActionResult<{ articles: CogniReadArticle[] }>> {
  const traceId = logger.startTrace("getArticlesByIdsAction");
  try {
    const validation = z.array(z.string().cuid2()).safeParse(articleIds);
    if (!validation.success) {
      logger.error("[getArticlesByIdsAction] IDs de artículo inválidos.", {
        errors: validation.error.flatten(),
      });
      return { success: false, error: "Los IDs proporcionados son inválidos." };
    }

    const validIds = validation.data;
    if (validIds.length === 0) {
      return { success: true, data: { articles: [] } };
    }

    logger.info(
      `[getArticlesByIdsAction] Solicitando ${validIds.length} artículos de la DB.`
    );

    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection("articles");

    const articlesCursor = collection.find({
      articleId: { $in: validIds },
    });
    const articlesArray = await articlesCursor.toArray();

    const validatedArticles = z
      .array(CogniReadArticleSchema)
      .parse(articlesArray);

    logger.success(
      `[getArticlesByIdsAction] Se recuperaron y validaron ${validatedArticles.length} artículos.`
    );
    logger.endTrace(traceId);

    return { success: true, data: { articles: validatedArticles } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "[getArticlesByIdsAction] Fallo al obtener artículos por IDs.",
      {
        error: errorMessage,
      }
    );
    logger.endTrace(traceId);
    return {
      success: false,
      error: "No se pudieron recuperar los artículos de la base de datos.",
    };
  }
}
