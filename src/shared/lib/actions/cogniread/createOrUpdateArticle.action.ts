// RUTA: src/shared/lib/actions/cogniread/createOrUpdateArticle.action.ts
/**
 * @file createOrUpdateArticle.action.ts
 * @description Server Action para crear o actualizar una entrada de artículo en CogniRead.
 *              Esta versión es isomórfica y puede operar tanto en un contexto de
 *              petición Next.js como en un entorno de script de backend.
 * @version 3.1.0 (Isomorphic & Context-Aware)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";
import { createServerClient as createNextServerClient } from "@/shared/lib/supabase/server";
import { type SupabaseClient } from "@supabase/supabase-js";
import {
  CogniReadArticleSchema,
  type CogniReadArticle,
} from "@/shared/lib/schemas/cogniread/article.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";
import { supportedLocales } from "@/shared/lib/i18n/i18n.config";

type ArticleInput = Omit<
  CogniReadArticle,
  "articleId" | "createdAt" | "updatedAt"
> & {
  articleId?: string;
  createdAt?: string;
};

export async function createOrUpdateArticleAction(
  input: ArticleInput,
  supabaseOverride?: SupabaseClient
): Promise<ActionResult<{ articleId: string }>> {
  const traceId = logger.startTrace("createOrUpdateArticleAction_v3.1");

  // Determina qué cliente de Supabase usar: el inyectado (para scripts) o el
  // basado en cookies (para la app Next.js).
  const supabase = supabaseOverride || createNextServerClient();

  try {
    // Solo en el contexto de Next.js intentamos obtener un usuario.
    // En el contexto de un script, operamos con privilegios de servicio.
    if (!supabaseOverride) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "auth_required" };
      }
    }

    logger.info(`[CogniReadAction] Iniciando creación/actualización para: ${input.articleId || "nuevo artículo"}`, { traceId });

    const now = new Date().toISOString();
    const articleId = input.articleId || createId();

    const articleDocument: CogniReadArticle = {
      ...input,
      articleId,
      createdAt: input.createdAt || now,
      updatedAt: now,
      baviHeroImageId: input.baviHeroImageId || undefined,
      relatedPromptIds: input.relatedPromptIds || [],
    };

    const validation = CogniReadArticleSchema.safeParse(articleDocument);
    if (!validation.success) {
      logger.error("[CogniReadAction] Los datos del artículo son inválidos.", { errors: validation.error.flatten(), traceId });
      return { success: false, error: "Los datos del artículo son inválidos según el esquema." };
    }

    const { data: validatedData } = validation;

    const supabasePayload = {
      id: validatedData.articleId,
      status: validatedData.status,
      study_dna: validatedData.studyDna,
      content: validatedData.content,
      bavi_hero_image_id: validatedData.baviHeroImageId || null,
      related_prompt_ids: validatedData.relatedPromptIds || [],
      created_at: validatedData.createdAt,
      updated_at: validatedData.updatedAt,
    };

    const { data, error } = await supabase
      .from("cogniread_articles")
      .upsert(supabasePayload, { onConflict: "id" })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // La revalidación de ruta solo tiene sentido en el contexto de Next.js
    if (!supabaseOverride) {
        revalidatePath("/news");
        for (const locale of supportedLocales) {
            const slug = validatedData.content[locale]?.slug;
            if (slug) {
                revalidatePath(`/${locale}/news/${slug}`);
            }
        }
    }

    logger.success(`[CogniReadAction] Artículo ${data.id} guardado con éxito en Supabase.`, { traceId });
    return { success: true, data: { articleId: data.id } };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[CogniReadAction] Fallo crítico al guardar el artículo.", { error: errorMessage, traceId });
    return { success: false, error: `No se pudo guardar el artículo: ${errorMessage}` };
  } finally {
    logger.endTrace(traceId);
  }
}
