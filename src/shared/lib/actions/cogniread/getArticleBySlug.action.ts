// RUTA: src/shared/lib/actions/cogniread/getArticleBySlug.action.ts
/**
 * @file getArticleBySlug.action.ts
 * @description Server Action para obtener un único artículo publicado por su slug y locale desde Supabase.
 * @version 2.1.0 (Holistic Elite Leveling)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { createServerClient } from "@/shared/lib/supabase/server";
import {
  CogniReadArticleSchema,
  type CogniReadArticle,
} from "@/shared/lib/schemas/cogniread/article.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE] ---
// Se importa la función de mapeo y los tipos soberanos desde su SSoT.
import {
  mapSupabaseToCogniReadArticle,
  type SupabaseCogniReadArticle,
} from "./getAllArticles.action";
// Se elimina la importación no utilizada de `zod`.
// --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

export async function getArticleBySlugAction(
  slug: string,
  locale: Locale
): Promise<ActionResult<{ article: CogniReadArticle | null }>> {
  const traceId = logger.startTrace("getArticleBySlugAction_v2.1_Supabase");
  logger.info(
    `[CogniReadAction] Obteniendo artículo por slug: "${slug}", locale: ${locale}...`,
    { traceId }
  );

  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from("cogniread_articles")
      .select("*")
      .eq("status", "published")
      .eq(`content->>${locale}->>slug`, slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        logger.warn(
          `[CogniReadAction] No se encontró artículo para slug: "${slug}", locale: ${locale}.`,
          { traceId }
        );
        return { success: true, data: { article: null } };
      }
      throw new Error(error.message);
    }

    // Se aplica el tipo soberano y se mapea de forma segura.
    const mappedArticle = mapSupabaseToCogniReadArticle(
      data as SupabaseCogniReadArticle
    );
    const validation = CogniReadArticleSchema.safeParse(mappedArticle);

    if (!validation.success) {
      throw new Error(
        "Formato de datos de artículo inesperado desde la base de datos."
      );
    }

    logger.success(
      `[CogniReadAction] Artículo encontrado para slug: "${slug}".`,
      { traceId, articleId: validation.data.articleId }
    );
    return { success: true, data: { article: validation.data } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "[CogniReadAction] Fallo crítico al obtener artículo por slug.",
      {
        error: errorMessage,
        traceId,
      }
    );
    return {
      success: false,
      error: `No se pudo recuperar el artículo: ${errorMessage}`,
    };
  } finally {
    logger.endTrace(traceId);
  }
}
