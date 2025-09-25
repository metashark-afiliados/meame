// RUTA: src/shared/lib/actions/cogniread/getArticlesIndex.action.ts
/**
 * @file getArticlesIndex.action.ts
 * @description Server Action de élite para obtener un índice de versiones de todos
 *              los artículos publicados. Forjado con resiliencia, observabilidad y
 *              una consulta de base de datos de alto rendimiento.
 * @version 2.0.0 (Holistic & Production-Ready)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { connectToDatabase } from "@/shared/lib/mongodb";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";

/**
 * @type ArticleIndex
 * @description Contrato de datos para el índice de versiones.
 *              Mapea un `articleId` (string) a su timestamp `updatedAt` (string ISO).
 */
type ArticleIndex = Record<string, string>;

/**
 * @function getArticlesIndexAction
 * @description Obtiene un mapa clave-valor de todos los artículos publicados,
 *              conteniendo su ID y su última fecha de modificación.
 *              Es la piedra angular del sistema de caché de cliente.
 * @returns {Promise<ActionResult<ArticleIndex>>} El índice de artículos o un error.
 */
export async function getArticlesIndexAction(): Promise<
  ActionResult<ArticleIndex>
> {
  const traceId = logger.startTrace("getArticlesIndexAction_v2.0");
  logger.info(
    "[CogniRead Action] Solicitando índice de versiones de artículos..."
  );

  try {
    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection("articles");

    logger.traceEvent(traceId, "Ejecutando consulta de proyección optimizada.");

    const articles = await collection
      .find({ status: "published" })
      .project<{ articleId: string; updatedAt: string }>({
        articleId: 1,
        updatedAt: 1,
        _id: 0,
      })
      .toArray();

    if (!articles) {
      logger.warn(
        "[CogniRead Action] La consulta a la base de datos no devolvió resultados.",
        { traceId }
      );
      return { success: true, data: {} };
    }

    const index = articles.reduce<ArticleIndex>((acc, article) => {
      // Guardia de integridad de datos por si un registro no tuviera los campos esperados
      if (article.articleId && article.updatedAt) {
        acc[article.articleId] = article.updatedAt;
      }
      return acc;
    }, {});

    logger.success(
      `[CogniRead Action] Índice de ${
        Object.keys(index).length
      } artículos generado con éxito.`
    );
    return { success: true, data: index };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "[CogniRead Action] Fallo crítico al obtener el índice de artículos.",
      { error: errorMessage, traceId }
    );
    return {
      success: false,
      error: "No se pudo generar el índice de versiones de artículos.",
    };
  } finally {
    logger.endTrace(traceId);
  }
}
