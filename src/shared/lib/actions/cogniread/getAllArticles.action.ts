// RUTA: src/shared/lib/actions/cogniread/getAllArticles.action.ts
/**
 * @file getAllArticles.action.ts
 * @description Server Action para obtener una lista paginada de TODOS los artículos.
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

const GetAllArticlesInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

type GetAllArticlesInput = z.infer<typeof GetAllArticlesInputSchema>;

export async function getAllArticlesAction(
  input: GetAllArticlesInput
): Promise<ActionResult<{ articles: CogniReadArticle[]; total: number }>> {
  const traceId = logger.startTrace("getAllArticlesAction_v4.0_RLS_Compliant");
  logger.info(
    `[CogniReadAction] Obteniendo todos los artículos (página ${input.page})...`,
    { traceId }
  );

  const supabase = createServerClient();

  try {
    const validatedInput = GetAllArticlesInputSchema.safeParse(input);
    if (!validatedInput.success) {
      return { success: false, error: "Parámetros de paginación inválidos." };
    }

    const { page, limit } = validatedInput.data;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // --- [INICIO DE SOLUCIÓN DEFINITIVA: CONSULTAS SEPARADAS] ---
    // 1. Obtener el conteo total de forma segura y compatible con RLS.
    const { count, error: countError } = await supabase
      .from("cogniread_articles")
      .select("*", { count: "exact", head: true });

    if (countError) throw new Error(countError.message);

    // 2. Obtener los datos de la página actual.
    const { data, error: dataError } = await supabase
      .from("cogniread_articles")
      .select("*")
      .order("updated_at", { ascending: false })
      .range(start, end);

    if (dataError) throw new Error(dataError.message);
    // --- [FIN DE SOLUCIÓN DEFINITIVA] ---

    const mappedArticles: CogniReadArticle[] = (
      (data as SupabaseCogniReadArticle[]) || []
    ).map(mapSupabaseToCogniReadArticle);
    const validation = z
      .array(CogniReadArticleSchema)
      .safeParse(mappedArticles);

    if (!validation.success) {
      throw new Error(
        "Formato de datos de artículos inesperado desde la base de datos."
      );
    }

    return {
      success: true,
      data: { articles: validation.data, total: count ?? 0 },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    return {
      success: false,
      error: `No se pudieron recuperar los artículos: ${errorMessage}`,
    };
  } finally {
    logger.endTrace(traceId);
  }
}
