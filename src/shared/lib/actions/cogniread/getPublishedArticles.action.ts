// RUTA: src/shared/lib/actions/cogniread/getPublishedArticles.action.ts
/**
 * @file getPublishedArticles.action.ts
 * @description Server Action para obtener una lista paginada de artículos publicados desde Supabase.
 * @version 2.2.0 (Holistic Elite Leveling & Type Integrity)
 * @author RaZ Podestá - MetaShark Tech
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
// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE] ---
// Se importa explícitamente el tipo soberano junto con la función de mapeo.
import {
  mapSupabaseToCogniReadArticle,
  type SupabaseCogniReadArticle,
} from "./getAllArticles.action";
// --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

const GetArticlesInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

type GetArticlesInput = z.infer<typeof GetArticlesInputSchema>;

export async function getPublishedArticlesAction(
  input: GetArticlesInput
): Promise<ActionResult<{ articles: CogniReadArticle[]; total: number }>> {
  const traceId = logger.startTrace("getPublishedArticlesAction_v2.2_Supabase");
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

    const { count, error: countError } = await supabase
      .from("cogniread_articles")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");

    if (countError) {
        throw new Error(countError.message);
    }

    const { data, error: dataError } = await supabase
      .from("cogniread_articles")
      .select("*")
      .eq("status", "published")
      .order("study_dna->>publicationDate", { ascending: false })
      .range(start, end);

    if (dataError) {
      throw new Error(dataError.message);
    }

    const mappedArticles: CogniReadArticle[] = (data as SupabaseCogniReadArticle[] || []).map(
      mapSupabaseToCogniReadArticle
    );
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
      {
        error: errorMessage,
        traceId,
      }
    );
    return {
      success: false,
      error: `No se pudieron recuperar los artículos publicados: ${errorMessage}`,
    };
  } finally {
    logger.endTrace(traceId);
  }
}
