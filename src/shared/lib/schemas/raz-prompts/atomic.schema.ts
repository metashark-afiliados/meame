// lib/schemas/raz-prompts/atomic.schema.ts
/**
 * @file atomic.schema.ts
 * @description SSoT para los schemas atómicos y reutilizables del ecosistema RaZPrompts.
 * @version 2.0.0 (Ideogram Parameters Expanded)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";

// --- [INICIO DE EXPANSIÓN ARQUITECTÓNICA] ---
export const IdeogramRenderingSpeedSchema = z.enum([
  "TURBO",
  "DEFAULT",
  "QUALITY",
]);
export const IdeogramStyleTypeSchema = z.enum([
  "AUTO",
  "GENERAL",
  "REALISTIC",
  "DESIGN",
  "FICTION",
]);
export const IdeogramAspectRatioSchema = z.enum([
  "1x1",
  "16x9",
  "9x16",
  "3x2",
  "2x3",
  "4x3",
  "3x4",
]);
export const IdeogramSizeSchema = z.enum([
  "512x512",
  "1024x1024",
  "1280x768",
  "768x1280",
  "1280x960",
  "960x1280",
]); // Ejemplo de tamaños comunes

export const PromptParametersSchema = z.object({
  seed: z.number().optional(),
  cfgScale: z.number().optional(),
  steps: z.number().int().positive().optional(),
  sampler: z.string().optional(),
  model: z.string().optional(),
  // Nuevos parámetros de Ideogram.ai
  renderingSpeed: IdeogramRenderingSpeedSchema.optional(),
  styleType: IdeogramStyleTypeSchema.optional(),
  aspectRatio: IdeogramAspectRatioSchema.optional(),
  numImages: z.number().int().min(1).max(8).optional(), // Número de imágenes a generar
  // Se añade un campo 'size' para tipado directo en la UI
  size: IdeogramSizeSchema.optional(),
});
// --- [FIN DE EXPANSIÓN ARQUITECTÓNICA] ---

export const RaZPromptsSesaTagsSchema = z.object({
  ai: z.string().regex(/^[a-z]{2,4}$/, "Código de IA inválido"),
  sty: z.string().regex(/^[a-z]{3}$/, "Código de Estilo inválido"),
  fmt: z.string(),
  typ: z.string().regex(/^[a-z]{3}$/, "Código de Tipo inválido"),
  sbj: z.string().regex(/^[a-z]{3}$/, "Código de Sujeto inválido"),
});

export type RaZPromptsSesaTags = z.infer<typeof RaZPromptsSesaTagsSchema>;

export const PromptVersionSchema = z.object({
  version: z.number().int().positive(),
  promptText: z.string().min(1, "El texto del prompt no puede estar vacío."),
  negativePrompt: z.string().optional(),
  parameters: PromptParametersSchema,
  createdAt: z.string().datetime(),
  embedding: z.array(z.number()).optional(),
});
