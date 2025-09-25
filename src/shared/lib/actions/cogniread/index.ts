// RUTA: src/shared/lib/actions/cogniread/index.ts
/**
 * @file index.ts (Barrel File)
 * @description Fachada pública para las Server Actions del dominio CogniRead.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
export * from "./createOrUpdateArticle.action";
export * from "./getAllArticles.action";
export * from "./getArticleById.action";
export * from "./getArticleBySlug.action";
export * from "./getCommentsByArticleId.action";
export * from "./getPublishedArticles.action";
export * from "./postComment.action";
