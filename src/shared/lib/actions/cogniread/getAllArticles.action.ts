// app/[locale]/(dev)/cogniread/_actions/getAllArticles.action.ts
/**
 * @file getAllArticles.action.ts
 * @description Server Action para obtener una lista paginada de TODOS los artículos de CogniRead.
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

const GetAllArticlesInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

type GetAllArticlesInput = z.infer<typeof GetAllArticlesInputSchema>;

export async function getAllArticlesAction(
  input: GetAllArticlesInput
): Promise<ActionResult<{ articles: CogniReadArticle[]; total: number }>> {
  const traceId = logger.startTrace("getAllArticlesAction");
  try {
    const { page, limit } = GetAllArticlesInputSchema.parse(input);

    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection("articles");

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      collection
        .find({}) // No hay filtro de 'status', los obtiene todos
        .sort({ updatedAt: -1 }) // Ordenar por la actualización más reciente
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments({}),
    ]);

    const validatedArticles = z.array(CogniReadArticleSchema).parse(articles);

    logger.success(
      `[CogniReadAction] Se recuperaron ${validatedArticles.length} de ${total} artículos totales.`
    );
    logger.endTrace(traceId);

    return { success: true, data: { articles: validatedArticles, total } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[CogniReadAction] Fallo al obtener todos los artículos.", {
      error: errorMessage,
    });
    logger.endTrace(traceId);
    return {
      success: false,
      error: "No se pudieron recuperar los artículos del dashboard.",
    };
  }
}
// app/[locale]/(dev)/cogniread/_actions/getAllArticles.action.ts
