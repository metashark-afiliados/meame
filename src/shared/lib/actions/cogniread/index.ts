// app/[locale]/(dev)/cogniread/_actions/index.ts
/**
 * @file index.ts (Barrel File)
 * @description Fachada pública para las Server Actions del módulo CogniRead.
 * @version 1.4.0 (Community Actions)
 * @author RaZ Podestá - MetaShark Tech
 */
export * from "./createOrUpdateArticle.action";
export * from "./getPublishedArticles.action";
export * from "./getArticleBySlug.action";
export * from "./getAllArticles.action";
export * from "./getArticleById.action";
export * from "./getCommentsByArticleId.action"; // <-- NUEVA EXPORTACIÓN
export * from "./postComment.action"; // <-- NUEVA EXPORTACIÓN
// app/[locale]/(dev)/cogniread/_actions/index.ts
