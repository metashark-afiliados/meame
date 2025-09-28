// RUTA: src/shared/lib/actions/cogniread/getAllArticles.action.ts
/**
 * @file getAllArticles.action.ts
 * @description Server Action para obtener una lista paginada de TODOS los artículos de CogniRead desde Supabase.
 * @version 2.2.0 (Sovereign Type Contract Export)
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

// --- INICIO DE REFACTORIZACIÓN DE ÉLITE: CONTRATOS SOBERANOS EXPORTADOS ---
export interface SupabaseStudyDna {
  originalTitle: string;
  authors: string[];
  institution: string;
  publication: string;
  publicationDate: string;
  doi: string;
  fundingSource: string;
  objective: string;
  studyType: string;
  methodologySummary: string;
  mainResults: string;
  authorsConclusion: string;
  limitations: string[];
}

export interface SupabaseArticleTranslation {
  title: string;
  slug: string;
  summary: string;
  body: string;
}

export interface SupabaseCogniReadArticle {
  id: string;
  status: "draft" | "published" | "archived";
  study_dna: SupabaseStudyDna;
  content: Record<string, SupabaseArticleTranslation>;
  bavi_hero_image_id: string | null;
  related_prompt_ids: string[];
  created_at: string;
  updated_at: string;
}

export function mapSupabaseToCogniReadArticle(
  supabaseArticle: SupabaseCogniReadArticle
): CogniReadArticle {
  return {
    articleId: supabaseArticle.id,
    status: supabaseArticle.status,
    studyDna: supabaseArticle.study_dna,
    content: supabaseArticle.content,
    baviHeroImageId: supabaseArticle.bavi_hero_image_id ?? undefined,
    relatedPromptIds: supabaseArticle.related_prompt_ids ?? [],
    createdAt: supabaseArticle.created_at,
    updatedAt: supabaseArticle.updated_at,
  };
}
// --- FIN DE REFACTORIZACIÓN DE ÉLITE ---

const GetAllArticlesInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

type GetAllArticlesInput = z.infer<typeof GetAllArticlesInputSchema>;

export async function getAllArticlesAction(
  input: GetAllArticlesInput
): Promise<ActionResult<{ articles: CogniReadArticle[]; total: number }>> {
  const traceId = logger.startTrace("getAllArticlesAction_v2.2_Supabase");
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

    const { data, error, count } = await supabase
      .from("cogniread_articles")
      .select("*, count()", { count: "exact" })
      .order("updated_at", { ascending: false })
      .range(start, end);

    if (error) {
      throw new Error(error.message);
    }

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
      error: `No se pudieron recuperar los artículos del dashboard: ${errorMessage}`,
    };
  }
}
