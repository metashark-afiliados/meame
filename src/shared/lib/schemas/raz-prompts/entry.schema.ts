// RUTA: src/shared/lib/schemas/raz-prompts/entry.schema.ts
/**
 * @file entry.schema.ts
 * @description Schema ensamblador y SSoT para una entrada completa en RaZPrompts.
 * @version 4.1.0 (Variant ID Linkage)
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
  status: z.enum(["pending_generation", "generated", "archived"]),

  // --- Versiones (El Historial Genético) ---
  versions: z.array(PromptVersionSchema).min(1),

  // --- VÍNCULOS ARQUITECTÓNICOS CLAVE ---
  baviAssetIds: z
    .array(z.string())
    .optional()
    .describe(
      "Array de IDs de activos en BAVI generados a partir de este prompt."
    ),
  // --- [INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
  baviVariantId: z
    .string()
    .optional()
    .describe(
      "El ID de la variante específica en BAVI que representa este prompt."
    ),
  // --- [FIN DE REFACTORIZACIÓN ARQUITECTÓNICA] ---

  // --- Sistema de Descubrimiento ---
  aiService: z.string(),
  tags: RaZPromptsSesaTagsSchema,
  keywords: z.array(z.string()),

  // --- Metadatos de Organización (Roadmap v2.0) ---
  collections: z.array(z.string().cuid2()).optional(),

  // --- Timestamps ---
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type RaZPromptsEntry = z.infer<typeof RaZPromptsEntrySchema>;
