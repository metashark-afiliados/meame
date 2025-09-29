// RUTA: src/shared/lib/actions/cogniread/getPublishedArticles.action.ts
/**
 * @file getPublishedArticles.action.ts
 * @description Server Action para obtener una lista paginada de artículos publicados.
 * @version 4.0.0 (RLS-Compliant & Resilient)
 * @author L.I.A. Legacy - Asistente de Refactorización
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

const GetArticlesInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

type GetArticlesInput = z.infer<typeof GetArticlesInputSchema>;

export async function getPublishedArticlesAction(
  input: GetArticlesInput
): Promise<ActionResult<{ articles: CogniReadArticle[]; total: number }>> {
  const traceId = logger.startTrace(
    "getPublishedArticlesAction_v4.0_RLS_Compliant"
  );
  logger.info(
    `[CogniReadAction] Obteniendo artículos publicados (página ${input.page})...`,
    { traceId }
  );

  const supabase = createServerClient();

  try {
    const validation = GetArticlesInputSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: "Parámetros de paginación inválidos." };
    }

    const { page, limit } = validation.data;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // --- [INICIO DE SOLUCIÓN DEFINITIVA: CONSULTAS SEPARADAS] ---
    // 1. Obtener el conteo total de forma segura y compatible con RLS.
    const { count, error: countError } = await supabase
      .from("cogniread_articles")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");

    if (countError) throw new Error(countError.message);

    // 2. Obtener los datos de la página actual.
    const { data, error: dataError } = await supabase
      .from("cogniread_articles")
      .select("*")
      .eq("status", "published")
      .order("study_dna->>publicationDate", { ascending: false })
      .range(start, end);

    if (dataError) throw new Error(dataError.message);
    // --- [FIN DE SOLUCIÓN DEFINITIVA] ---

    const mappedArticles: CogniReadArticle[] = (
      (data as SupabaseCogniReadArticle[]) || []
    ).map(mapSupabaseToCogniReadArticle);
    const validationResult = z
      .array(CogniReadArticleSchema)
      .safeParse(mappedArticles);

    if (!validationResult.success) {
      throw new Error(
        "Formato de datos de artículos inesperado desde la base de datos."
      );
    }

    return {
      success: true,
      data: { articles: validationResult.data, total: count ?? 0 },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "[CogniReadAction] Fallo crítico al obtener artículos publicados.",
      { error: errorMessage, traceId }
    );
    return {
      success: false,
      error: `No se pudieron recuperar los artículos publicados: ${errorMessage}`,
    };
  } finally {
    logger.endTrace(traceId);
  }
}
