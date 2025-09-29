// RUTA: src/shared/lib/schemas/cogniread/article.schema.ts
/**
 * @file article.schema.ts
 * @description SSoT para el contrato de datos de la entidad Artículo de CogniRead.
 *              Define la estructura para un registro en la tabla 'cogniread_articles' de Supabase.
 * @version 3.0.0 (Production Ready - Tagging & Search Enabled)
 * @author L.I.A. Legacy - Asistente de Refactorización
 */
import { z } from "zod";
import { supportedLocales } from "@/shared/lib/i18n/i18n.config";

/**
 * @const ArticleTranslationSchema
 * @description Valida el contenido de la versión divulgativa de un artículo en un idioma específico.
 *              Es la SSoT para el contenido multilingüe.
 */
export const ArticleTranslationSchema = z.object({
  /** Título del artículo para el público en un locale específico. */
  title: z.string().min(1, "El título no puede estar vacío."),
  /** URL amigable para SEO en un locale específico. */
  slug: z
    .string()
    .min(1, "El slug es requerido.")
    .regex(
      /^[a-z0-9-]+$/,
      "El slug solo puede contener letras minúsculas, números y guiones."
    ),
  /** Resumen corto y persuasivo para vistas previas y metadatos SEO. */
  summary: z.string().min(1, "El resumen no puede estar vacío."),
  /** Contenido completo del artículo en formato Markdown. */
  body: z.string().min(1, "El cuerpo del artículo no puede estar vacío."),
});

/**
 * @const StudyDnaSchema
 * @description Valida la estructura de los datos extraídos del estudio científico.
 *              Es la materialización del "Prompt Maestro" y el genoma de la evidencia.
 *              Las descripciones `.describe()` contienen pistas de UI para el renderizador de formularios dinámico.
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
 * @description El schema principal y soberano para un artículo en CogniRead. Este es el
 *              contrato de datos final que debe cumplir cualquier artículo en el ecosistema.
 */
export const CogniReadArticleSchema = z.object({
  // --- Metadatos de Sistema ---
  articleId: z.string().cuid2("El ID del artículo debe ser un CUID2 válido."),
  status: z.enum(["draft", "published", "archived"], {
    invalid_type_error: "El estado del artículo es inválido.",
  }),
  createdAt: z
    .string()
    .datetime(
      "La fecha de creación debe ser un formato de fecha y hora ISO válido."
    ),
  updatedAt: z
    .string()
    .datetime(
      "La fecha de actualización debe ser un formato de fecha y hora ISO válido."
    ),

  // --- El ADN del Estudio (SSoT de la Evidencia) ---
  studyDna: StudyDnaSchema,

  // --- Contenido Divulgativo (SSoT de la Comunicación) ---
  content: z.record(
    z.enum(supportedLocales),
    ArticleTranslationSchema.partial() // Partial para permitir borradores sin todos los idiomas.
  ),

  // --- Descubrimiento y Taxonomía ---
  tags: z
    .array(z.string())
    .optional()
    .describe("Etiquetas temáticas para búsqueda y filtrado."),

  // --- Vínculos del Ecosistema ---
  baviHeroImageId: z
    .string()
    .optional()
    .describe("ID del activo visual de BAVI para la imagen destacada."),
  relatedPromptIds: z
    .array(
      z
        .string()
        .cuid2("Los IDs de prompt relacionados deben ser CUID2 válidos.")
    )
    .optional()
    .describe("IDs de prompts de RaZPrompts relacionados con este artículo."),
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
