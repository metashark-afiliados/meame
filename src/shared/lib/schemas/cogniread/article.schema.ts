// RUTA: src/shared/lib/schemas/cogniread/article.schema.ts
/**
 * @file article.schema.ts
 * @description SSoT para el contrato de datos de la entidad Artículo de CogniRead.
 *              Define la estructura para un documento en la tabla 'cogniread_articles' de Supabase.
 * @version 2.0.0 (Manifesto Formalization & Supabase Migration)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { supportedLocales } from "@/shared/lib/i18n/i18n.config";

/**
 * @const ArticleTranslationSchema
 * @description Valida el contenido de un artículo de blog en un idioma específico.
 */
export const ArticleTranslationSchema = z.object({
  title: z.string().min(1, "El título no puede estar vacío."),
  slug: z
    .string()
    .min(1, "El slug es requerido.")
    .regex(
      /^[a-z0-9-]+$/,
      "El slug solo puede contener letras minúsculas, números y guiones."
    ),
  summary: z.string().min(1, "El resumen no puede estar vacío."),
  body: z.string().min(1, "El cuerpo del artículo no puede estar vacío."),
});

/**
 * @const StudyDnaSchema
 * @description Valida la estructura de los datos extraídos del estudio científico.
 *              Esta es la materialización de nuestro "Prompt Maestro". Las descripciones
 *              contienen pistas de UI para el renderizador de formularios dinámico.
 */
export const StudyDnaSchema = z.object({
  originalTitle: z
    .string()
    .min(1)
    .describe("ui:label:Título Original del Estudio"),
  authors: z.array(z.string().min(1)).min(1).describe("ui:label:Autores"),
  institution: z.string().min(1).describe("ui:label:Institución Principal"),
  publication: z.string().min(1).describe("ui:label:Revista o Publicación"),
  publicationDate: z
    .string()
    .datetime()
    .describe("ui:label:Fecha de Publicación"),
  doi: z.string().url().describe("ui:label:Enlace DOI"),
  fundingSource: z.string().min(1).describe("ui:label:Fuente de Financiación"),
  objective: z
    .string()
    .min(1)
    .describe("ui:label:Objetivo Principal|ui:control:textarea"),
  studyType: z.string().min(1).describe("ui:label:Tipo de Estudio"),
  methodologySummary: z
    .string()
    .min(1)
    .describe("ui:label:Resumen de Metodología|ui:control:textarea"),
  mainResults: z
    .string()
    .min(1)
    .describe("ui:label:Resultados Principales|ui:control:textarea"),
  authorsConclusion: z
    .string()
    .min(1)
    .describe("ui:label:Conclusión de los Autores|ui:control:textarea"),
  limitations: z
    .array(z.string().min(1))
    .min(1)
    .describe("ui:label:Limitaciones del Estudio"),
});

/**
 * @const CogniReadArticleSchema
 * @description El schema principal y soberano para un artículo en CogniRead.
 */
export const CogniReadArticleSchema = z.object({
  articleId: z.string().cuid2(),
  status: z.enum(["draft", "published", "archived"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  studyDna: StudyDnaSchema,
  content: z.record(
    z.enum(supportedLocales),
    ArticleTranslationSchema.partial()
  ),
  baviHeroImageId: z.string().optional(),
  relatedPromptIds: z.array(z.string().cuid2()).optional(),
});

export type CogniReadArticle = z.infer<typeof CogniReadArticleSchema>;
export type ArticleTranslation = z.infer<typeof ArticleTranslationSchema>;
export type StudyDna = z.infer<typeof StudyDnaSchema>;
