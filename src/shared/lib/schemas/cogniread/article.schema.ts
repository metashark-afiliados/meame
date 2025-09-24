// shared/lib/schemas/cogniread/article.schema.ts
/**
 * @file article.schema.ts
 * @description SSoT para el contrato de datos de la entidad Artículo de CogniRead.
 *              Define la estructura para un documento en la colección 'articles' de MongoDB.
 * @version 1.0.0
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
 *              Esta es la materialización de nuestro "Prompt Maestro".
 */
export const StudyDnaSchema = z.object({
  // Sección A: Identificación
  originalTitle: z.string(),
  authors: z.array(z.string()),
  institution: z.string(),
  publication: z.string(),
  publicationDate: z.string().datetime(),
  doi: z.string().url(),
  fundingSource: z.string(),
  // Secciones B, C, D...
  objective: z.string(),
  studyType: z.string(),
  methodologySummary: z.string(),
  mainResults: z.string(),
  authorsConclusion: z.string(),
  limitations: z.array(z.string()),
});

/**
 * @const CogniReadArticleSchema
 * @description El schema principal y soberano para un artículo en CogniRead.
 */
export const CogniReadArticleSchema = z.object({
  // --- Metadatos de CogniRead ---
  articleId: z.string().cuid2(),
  status: z.enum(["draft", "published", "archived"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // --- El ADN del Estudio (SSoT de Evidencia) ---
  studyDna: StudyDnaSchema,

  // --- Contenido Multilingüe (SSoT de Divulgación) ---
  content: z.record(z.enum(supportedLocales), ArticleTranslationSchema),

  // --- Vínculos del Ecosistema ---
  baviHeroImageId: z.string().optional(),
  relatedPromptIds: z.array(z.string()).optional(),
});

/**
 * @type CogniReadArticle
 * @description Infiere el tipo TypeScript para un artículo completo de CogniRead.
 */
export type CogniReadArticle = z.infer<typeof CogniReadArticleSchema>;

/**
 * @type ArticleTranslation
 * @description Infiere el tipo TypeScript para el contenido de una traducción.
 */
export type ArticleTranslation = z.infer<typeof ArticleTranslationSchema>;

/**
 * @type StudyDna
 * @description Infiere el tipo TypeScript para el ADN del estudio.
 */
export type StudyDna = z.infer<typeof StudyDnaSchema>;
// shared/lib/schemas/cogniread/article.schema.ts
