// app/[locale]/(dev)/cogniread/_actions/getArticleBySlug.action.ts
/**
 * @file getArticleBySlug.action.ts
 * @description Server Action para obtener un único artículo publicado por su slug y locale.
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
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";

export async function getArticleBySlugAction(
  slug: string,
  locale: Locale
): Promise<ActionResult<{ article: CogniReadArticle | null }>> {
  const traceId = logger.startTrace("getArticleBySlugAction");
  try {
    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection("articles");

    // Construimos la query para buscar dentro del objeto anidado 'content'
    const query = {
      status: "published",
      [`content.${locale}.slug`]: slug,
    };

    const article = await collection.findOne(query);

    if (!article) {
      logger.warn(
        `[CogniReadAction] No se encontró artículo para slug: ${slug}`
      );
      return { success: true, data: { article: null } };
    }

    const validatedArticle = CogniReadArticleSchema.parse(article);
    logger.success(`[CogniReadAction] Artículo encontrado para slug: ${slug}`, {
      articleId: validatedArticle.articleId,
    });
    logger.endTrace(traceId);

    return { success: true, data: { article: validatedArticle } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[CogniReadAction] Fallo al obtener artículo por slug.", {
      error: errorMessage,
    });
    logger.endTrace(traceId);
    return {
      success: false,
      error: "No se pudo recuperar el artículo.",
    };
  }
}
// app/[locale]/(dev)/cogniread/_actions/getArticleBySlug.action.ts
