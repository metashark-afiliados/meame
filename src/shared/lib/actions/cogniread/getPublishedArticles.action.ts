// app/[locale]/(dev)/cogniread/_actions/getPublishedArticles.action.ts
/**
 * @file getPublishedArticles.action.ts
 * @description Server Action para obtener una lista paginada de artículos publicados.
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

const GetArticlesInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

type GetArticlesInput = z.infer<typeof GetArticlesInputSchema>;

export async function getPublishedArticlesAction(
  input: GetArticlesInput
): Promise<ActionResult<{ articles: CogniReadArticle[]; total: number }>> {
  const traceId = logger.startTrace("getPublishedArticlesAction");
  try {
    const validation = GetArticlesInputSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: "Parámetros de paginación inválidos." };
    }
    const { page, limit } = validation.data;

    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection("articles");

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      collection
        .find({ status: "published" })
        .sort({ "studyDna.publicationDate": -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments({ status: "published" }),
    ]);

    // Validamos cada artículo recuperado contra el schema
    const validatedArticles = z.array(CogniReadArticleSchema).parse(articles);

    logger.success(
      `[CogniReadAction] Se recuperaron ${validatedArticles.length} de ${total} artículos publicados.`
    );
    logger.endTrace(traceId);

    return { success: true, data: { articles: validatedArticles, total } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[CogniReadAction] Fallo al obtener artículos publicados.", {
      error: errorMessage,
    });
    logger.endTrace(traceId);
    return {
      success: false,
      error: "No se pudieron recuperar los artículos.",
    };
  }
}
// app/[locale]/(dev)/cogniread/_actions/getPublishedArticles.action.ts
