// RUTA: src/shared/lib/actions/cogniread/index.ts
/**
 * @file index.ts (Barrel File)
 * @description Fachada pública para las Server Actions del dominio CogniRead.
 * @version 2.1.0 (Explicit Export Resolution)
 * @author RaZ Podestá - MetaShark Tech
 */

// Se importan explícitamente los miembros de cada módulo
import { createOrUpdateArticleAction } from "./createOrUpdateArticle.action";
import { getAllArticlesAction } from "./getAllArticles.action";
import { getArticleByIdAction } from "./getArticleById.action";
import { getArticleBySlugAction } from "./getArticleBySlug.action";
import { getCommentsByArticleIdAction } from "./getCommentsByArticleId.action";
import { getPublishedArticlesAction } from "./getPublishedArticles.action";
import { postCommentAction } from "./postComment.action";
import { getArticlesIndexAction } from "./getArticlesIndex.action";
import { getArticlesByIdsAction } from "./getArticlesByIds.action";

// Se re-exportan en un único objeto para evitar conflictos de nombres
export {
  createOrUpdateArticleAction,
  getAllArticlesAction,
  getArticleByIdAction,
  getArticleBySlugAction,
  getCommentsByArticleIdAction,
  getPublishedArticlesAction,
  postCommentAction,
  getArticlesIndexAction,
  getArticlesByIdsAction,
};
