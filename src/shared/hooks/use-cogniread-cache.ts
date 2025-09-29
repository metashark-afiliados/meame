// RUTA: src/shared/hooks/use-cogniread-cache.ts
/**
 * @file use-cogniread-cache.ts
 * @description Hook "cerebro" para la gestión de la caché de cliente de CogniRead.
 * @version 4.0.0 (Lean & Clean)
 * @author L.I.A. Legacy - Asistente de Refactorización
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
// --- [INICIO DE REFACTORIZACIÓN DE HIGIENE] ---
// Se eliminan las importaciones de 'actions' que no se utilizan.
// --- [FIN DE REFACTORIZACIÓN DE HIGIENE] ---
import type { CogniReadArticle } from "@/shared/lib/schemas/cogniread/article.schema";
import { logger } from "@/shared/lib/logging";

const ARTICLE_PREFIX = "cogniread_article_";

export function useCogniReadCache() {
  const [articles, setArticles] = useState<CogniReadArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFromCache = useCallback(() => {
    setIsLoading(true);
    try {
      // Esta es una simplificación temporal. Necesitaremos un índice para saber qué artículos cargar.
      // Por ahora, asumimos que conocemos los IDs o los recuperamos de otra fuente.
      // En una implementación real, aquí llamaríamos a getArticlesIndexAction.
      const hardcodedIds = [
        "clwz1a2b30000cde45f6g7h8j",
        "clwz1a2b30000cde45f6g7h8i",
        "clwz1a2b30000cde45f6g7h8l",
        "clwz1a2b30000cde45f6g7h8k",
      ];

      const articlesFromCache: CogniReadArticle[] = hardcodedIds
        .map((id) => {
          const articleStr = localStorage.getItem(`${ARTICLE_PREFIX}${id}`);
          return articleStr ? JSON.parse(articleStr) : null;
        })
        .filter((a): a is CogniReadArticle => a !== null);

      setArticles(articlesFromCache);
      if (articlesFromCache.length > 0) {
        toast.info("Artículos cargados desde la caché local.");
      }
    } catch (error) {
      logger.error("[CogniRead Cache] Error al cargar desde localStorage.", {
        error,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadFromCache();
    }
  }, [loadFromCache]);

  return { articles, isLoading };
}
