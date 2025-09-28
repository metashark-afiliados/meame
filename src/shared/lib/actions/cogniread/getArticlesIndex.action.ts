// RUTA: src/shared/lib/actions/cogniread/getArticlesIndex.action.ts
/**
 * @file getArticlesIndex.action.ts
 * @description Server Action de élite para obtener un índice de versiones de todos
 *              los artículos publicados desde Supabase. Forjado con resiliencia,
 *              observabilidad y una consulta de base de datos de alto rendimiento.
 * @version 3.0.0 (Migración a Supabase)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

// Se elimina la importación de MongoDB
// import { connectToDatabase } from "@/shared/lib/mongodb";
import { createServerClient } from "@/shared/lib/supabase/server";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";

/**
 * @type ArticleIndex
 * @description Contrato de datos para el índice de versiones.
 *              Mapea un `articleId` (string) a su timestamp `updatedAt` (string ISO).
 */
type ArticleIndex = Record<string, string>;

// --- Tipo interno para la respuesta de Supabase ---
interface SupabaseArticleIndexEntry {
  id: string;
  updated_at: string;
}

export async function getArticlesIndexAction(): Promise<
  ActionResult<ArticleIndex>
> {
  const traceId = logger.startTrace("getArticlesIndexAction_v3.0_Supabase");
  logger.info(
    "[CogniRead Action] Solicitando índice de versiones de artículos publicados desde Supabase...",
    { traceId }
  );

  const supabase = createServerClient(); // Obtener el cliente de Supabase

  try {
    logger.traceEvent(traceId, "Ejecutando consulta de proyección optimizada en Supabase.");

    const { data: articles, error } = await supabase
      .from("cogniread_articles")
      .select("id, updated_at") // Proyectar solo las columnas necesarias
      .eq("status", "published"); // Filtrar solo por artículos publicados

    if (error) {
      logger.error("[CogniRead Action] Error al obtener el índice de artículos de Supabase.", {
        error: error.message,
        traceId,
      });
      throw new Error(error.message);
    }

    if (!articles || articles.length === 0) {
      logger.warn(
        "[CogniRead Action] La consulta a Supabase no devolvió resultados para artículos publicados.",
        { traceId }
      );
      return { success: true, data: {} };
    }

    const index = articles.reduce<ArticleIndex>((acc, article) => {
      // Guardia de integridad de datos para asegurar que los registros de Supabase tienen los campos esperados
      const typedArticle = article as SupabaseArticleIndexEntry; // Aserción de tipo para seguridad

      if (typedArticle.id && typedArticle.updated_at) {
        acc[typedArticle.id] = typedArticle.updated_at;
      } else {
        logger.warn(`[CogniRead Action] Registro de artículo incompleto omitido del índice: ${JSON.stringify(article)}`, { traceId });
      }
      return acc;
    }, {});

    logger.success(
      `[CogniRead Action] Índice de ${Object.keys(index).length} artículos publicados generado con éxito desde Supabase.`,
      { traceId }
    );
    return { success: true, data: index };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "[CogniRead Action] Fallo crítico al obtener el índice de artículos publicados.",
      { error: errorMessage, traceId }
    );
    return {
      success: false,
      error: `No se pudo generar el índice de versiones de artículos: ${errorMessage}`,
    };
  } finally {
    logger.endTrace(traceId);
  }
}
