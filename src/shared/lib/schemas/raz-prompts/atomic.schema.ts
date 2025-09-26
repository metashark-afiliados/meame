// RUTA: src/shared/lib/schemas/raz-prompts/atomic.schema.ts
/**
 * @file atomic.schema.ts
 * @description SSoT para los schemas atómicos y reutilizables del ecosistema RaZPrompts.
 * @version 2.1.0 (Flexible SESA Regex)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";

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
]);

export const PromptParametersSchema = z.object({
  seed: z.number().optional(),
  cfgScale: z.number().optional(),
  steps: z.number().int().positive().optional(),
  sampler: z.string().optional(),
  model: z.string().optional(),
  renderingSpeed: IdeogramRenderingSpeedSchema.optional(),
  styleType: IdeogramStyleTypeSchema.optional(),
  aspectRatio: IdeogramAspectRatioSchema.optional(),
  numImages: z.number().int().min(1).max(8).optional(),
  size: IdeogramSizeSchema.optional(),
});

export const RaZPromptsSesaTagsSchema = z.object({
  ai: z.string().regex(/^[a-z]{2,4}$/, "Código de IA inválido"),
  sty: z.string().regex(/^[a-z]{3}$/, "Código de Estilo inválido"),
  fmt: z.string(), // fmt puede ser "16x9", por lo que no lleva regex de solo letras.
  // --- [INICIO DE REFACTORIZACIÓN DE ÉLITE] ---
  // Se flexibiliza la validación para permitir códigos de 2 a 4 caracteres.
  typ: z.string().regex(/^[a-z]{2,4}$/, "Código de Tipo inválido"),
  sbj: z.string().regex(/^[a-z]{3,4}$/, "Código de Sujeto inválido"),
  // --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---
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
