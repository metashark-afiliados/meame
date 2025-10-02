// RUTA: src/shared/lib/actions/cogniread/getPublishedArticles.action.ts
/**
 * @file getPublishedArticles.action.ts
 * @description Server Action para obtener artículos publicados.
 *              v8.0.0 (Build-Resilient & Context-Agnostic): Se elimina la
 *              verificación de sesión de usuario para hacer la acción segura
 *              para su consumo en contextos sin petición (request), como
 *              generateStaticParams, resolviendo un fallo crítico de build.
 * @version 8.0.0
 *@author L.I.A. Legacy
 */
"use server";

import { z } from "zod";
import { createServerClient } from "@/shared/lib/supabase/server";
import {
  CogniReadArticleSchema,
  type CogniReadArticle,
} from "@/shared/lib/schemas/cogniread/article.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";
import {
  mapSupabaseToCogniReadArticle,
  type SupabaseCogniReadArticle,
} from "./_shapers/cogniread.shapers";
import type { PostgrestResponse } from "@supabase/supabase-js";

const GetPublishedArticlesInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});
type GetPublishedArticlesInput = z.infer<
  typeof GetPublishedArticlesInputSchema
>;

async function _processArticleQuery(
  queryPromise: PromiseLike<PostgrestResponse<SupabaseCogniReadArticle>>
): Promise<{ articles: CogniReadArticle[]; total: number }> {
  const { data, error, count } = await queryPromise;

  if (error) {
    logger.error("[_processArticleQuery] Error en la respuesta de Supabase.", {
      error: error.message,
    });
    throw new Error(error.message);
  }

  const mappedArticles: CogniReadArticle[] = (data || []).map(
    mapSupabaseToCogniReadArticle
  );

  const validation = z.array(CogniReadArticleSchema).safeParse(mappedArticles);
  if (!validation.success) {
    logger.error("[_processArticleQuery] Los datos de la DB están corruptos.", {
      errors: validation.error.flatten(),
    });
    throw new Error(
      "Formato de datos de artículos inesperado desde la base de datos."
    );
  }

  return { articles: validation.data, total: count ?? 0 };
}

export async function getPublishedArticlesAction(
  input: GetPublishedArticlesInput
): Promise<ActionResult<{ articles: CogniReadArticle[]; total: number }>> {
  const traceId = logger.startTrace("getPublishedArticlesAction_v8.0");
  logger.info(
    `[CogniReadAction] Obteniendo artículos publicados (página ${input.page})...`,
    { traceId }
  );

  try {
    const supabase = createServerClient();
    const validatedInput = GetPublishedArticlesInputSchema.parse(input);
    const { page, limit } = validatedInput;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
    // Se elimina la verificación de sesión de usuario, ya que los artículos
    // publicados son datos públicos y esta acción se usa en contextos de build.
    // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---

    const query = supabase
      .from("cogniread_articles")
      .select("*, count()", { count: "exact" })
      .eq("status", "published")
      .order("study_dna->>publicationDate", { ascending: false })
      .range(start, end);

    const result = await _processArticleQuery(query);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(`[getPublishedArticlesAction] Fallo crítico.`, {
      error: errorMessage,
      traceId,
    });
    return {
      success: false,
      error: `No se pudieron recuperar los artículos publicados: ${errorMessage}`,
    };
  } finally {
    logger.endTrace(traceId);
  }
}
