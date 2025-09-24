// Ruta correcta: src/shared/lib/actions/cogniread/createOrUpdateArticle.action.ts
/**
 * @file createOrUpdateArticle.action.ts
 * @description Server Action para crear o actualizar una entrada de artículo en CogniRead.
 * @version 2.2.0 (Sovereign Path Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";
import { connectToDatabase } from "@/shared/lib/mongodb";
import {
  CogniReadArticleSchema,
  type CogniReadArticle,
} from "@/shared/lib/schemas/cogniread/article.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";
import { supportedLocales } from "@/shared/lib/i18n/i18n.config";

type ArticleInput = Omit<CogniReadArticle, "articleId" | "updatedAt"> & {
  articleId?: string;
};

export async function createOrUpdateArticleAction(
  input: ArticleInput
): Promise<ActionResult<{ articleId: string }>> {
  const traceId = logger.startTrace("createOrUpdateArticleAction");
  try {
    const now = new Date().toISOString();
    const articleId = input.articleId || createId();

    const articleDocument: CogniReadArticle = {
      ...input,
      articleId,
      updatedAt: now,
      createdAt: input.createdAt || now,
    };

    const validation = CogniReadArticleSchema.safeParse(articleDocument);
    if (!validation.success) {
      logger.error(
        "[CogniReadAction] Fallo de validación de datos del artículo.",
        { error: validation.error.flatten() }
      );
      return { success: false, error: "Los datos del artículo son inválidos." };
    }

    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection<CogniReadArticle>("articles");

    const result = await collection.updateOne(
      { articleId: validation.data.articleId },
      { $set: validation.data },
      { upsert: true }
    );

    if (result.modifiedCount === 0 && result.upsertedCount === 0) {
      throw new Error(
        "La operación en la base de datos no modificó ni insertó ningún documento."
      );
    }

    const actionType = result.upsertedCount > 0 ? "creado" : "actualizado";
    logger.success(
      `[CogniReadAction] Artículo ${actionType} con éxito: ${articleId}`
    );

    logger.trace("[CogniReadAction] Iniciando revalidación de caché...");
    revalidatePath("/news");

    for (const locale of supportedLocales) {
      const slug = validation.data.content[locale]?.slug;
      if (slug) {
        const path = `/${locale}/news/${slug}`;
        revalidatePath(path);
        logger.trace(`[CogniReadAction] Revalidando ruta: ${path}`);
      }
    }

    logger.endTrace(traceId);
    return { success: true, data: { articleId } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[CogniReadAction] Fallo crítico en la acción.", {
      error: errorMessage,
    });
    logger.endTrace(traceId);
    return {
      success: false,
      error: `No se pudo guardar el artículo: ${errorMessage}`,
    };
  }
}
// Ruta correcta: src/shared/lib/actions/cogniread/createOrUpdateArticle.action.ts
