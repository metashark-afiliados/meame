// lib/schemas/raz-prompts/entry.schema.ts
/**
 * @file entry.schema.ts
 * @description Schema ensamblador y SSoT para una entrada completa en RaZPrompts.
 *              v3.0.0 (Image URL for Vault Display): Introduce 'imageUrl' para la visualización.
 * @version 3.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { PromptVersionSchema, RaZPromptsSesaTagsSchema } from "./atomic.schema";

export const RaZPromptsEntrySchema = z.object({
  // --- Metadatos de Identificación ---
  promptId: z
    .string()
    .cuid2({ message: "El ID del prompt debe ser un CUID2 válido." }),
  userId: z.string(),

  // --- Datos Descriptivos ---
  title: z.string().min(3).max(100),

  // --- [NUEVO] Gestión del Ciclo de Vida ---
  status: z.enum(["pending_generation", "generated"]),

  // --- Versiones del Prompt ---
  versions: z.array(PromptVersionSchema).min(1),

  // --- Conexión Simbiótica con BAVI (Ahora Opcional) ---
  baviAssetId: z.string().optional(),
  baviVariantId: z.string().optional(),
  imageUrl: z.string().url().optional(), // <-- NUEVO: URL de la imagen para mostrar en la bóveda

  // --- Sistema de Descubrimiento ---
  aiService: z.string(), // Dato derivado, SSoT es `tags.ai`
  tags: RaZPromptsSesaTagsSchema,
  keywords: z.array(z.string()),

  // --- Timestamps ---
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type RaZPromptsEntry = z.infer<typeof RaZPromptsEntrySchema>;
