// RUTA: src/shared/hooks/use-cogniread-cache.ts
/**
 * @file use-cogniread-cache.ts
 * @description Hook "cerebro" para la gestión de la caché de cliente de CogniRead.
 *              Orquesta la sincronización inteligente de artículos con localStorage.
 * @version 2.2.0 (Definitive Linter Hygiene)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  getArticlesIndexAction,
  getArticlesByIdsAction,
} from "@/shared/lib/actions/cogniread";
import type { CogniReadArticle } from "@/shared/lib/schemas/cogniread/article.schema";
import { logger } from "@/shared/lib/logging";

const INDEX_KEY = "cogniread_version_index";
const ARTICLE_PREFIX = "cogniread_article_";

type ArticleIndex = Record<string, string>;

export function useCogniReadCache() {
  const [articles, setArticles] = useState<CogniReadArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const syncCache = useCallback(async () => {
    logger.startGroup("[CogniRead Cache] Iniciando sincronización...");
    setIsLoading(true);

    try {
      const serverIndexResult = await getArticlesIndexAction();
      if (!serverIndexResult.success) {
        throw new Error("No se pudo obtener el índice del servidor.");
      }
      const serverIndex = serverIndexResult.data;

      let localIndex: ArticleIndex = {};
      try {
        const localIndexStr = localStorage.getItem(INDEX_KEY);
        if (localIndexStr) localIndex = JSON.parse(localIndexStr);
      } catch {
        // <-- CORRECCIÓN DEFINITIVA APLICADA
        logger.warn(
          "[CogniRead Cache] El índice local está corrupto, se reconstruirá."
        );
      }

      const articleIdsToFetch = Object.keys(serverIndex).filter(
        (id) => localIndex[id] !== serverIndex[id]
      );

      logger.trace(
        `[CogniRead Cache] Se encontraron ${articleIdsToFetch.length} artículos para sincronizar.`
      );

      if (articleIdsToFetch.length > 0) {
        const articlesResult = await getArticlesByIdsAction(articleIdsToFetch);
        if (articlesResult.success) {
          for (const article of articlesResult.data.articles) {
            localStorage.setItem(
              `${ARTICLE_PREFIX}${article.articleId}`,
              JSON.stringify(article)
            );
          }
          const updatedLocalIndex = { ...localIndex, ...serverIndex };
          localStorage.setItem(INDEX_KEY, JSON.stringify(updatedLocalIndex));
          logger.success(
            `[CogniRead Cache] ${articlesResult.data.articles.length} artículos actualizados en localStorage.`
          );
        } else {
          throw new Error(
            "No se pudieron descargar los artículos actualizados."
          );
        }
      }

      const allArticleIds = Object.keys(serverIndex);
      const articlesFromCache: CogniReadArticle[] = [];
      for (const id of allArticleIds) {
        try {
          const articleStr = localStorage.getItem(`${ARTICLE_PREFIX}${id}`);
          if (articleStr) articlesFromCache.push(JSON.parse(articleStr));
        } catch {
          // <-- CORRECCIÓN DEFINITIVA APLICADA
          logger.warn(
            `[CogniRead Cache] Artículo corrupto en caché omitido: ${id}`
          );
        }
      }

      setArticles(articlesFromCache);
      toast.info("Contenido actualizado.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido.";
      logger.error("[CogniRead Cache] Fallo en el proceso de sincronización.", {
        error: errorMessage,
      });
      toast.error("Error al sincronizar el contenido", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
      logger.endGroup();
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      syncCache();
    }
  }, [syncCache]);

  return { articles, isLoading };
}
