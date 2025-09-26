// RUTA: src/shared/lib/schemas/bavi/bavi.manifest.schema.ts
/**
 * @file bavi.manifest.schema.ts
 * @description SSoT para el contrato de datos del manifiesto BAVI.
 * @version 3.0.0 (Sovereign Schema Export)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { RaZPromptsSesaTagsSchema } from "../raz-prompts/atomic.schema";

const BaviVariantSchema = z.object({
  versionId: z.string(),
  publicId: z.string(),
  state: z.enum(["orig", "enh"]),
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
  }),
});

// --- [INICIO DE REFACTORIZACIÓN SOBERANA] ---
// Se exporta el schema para que pueda ser consumido por otros módulos para validación.
export const BaviAssetSchema = z.object({
  assetId: z.string(),
  provider: z.enum(["cloudinary"]),
  promptId: z.string().optional(),
  tags: RaZPromptsSesaTagsSchema.partial().optional(), // tags ahora es opcional
  variants: z.array(BaviVariantSchema).min(1),
  metadata: z.object({
    altText: z.record(z.string()),
  }),
  imageUrl: z.string().url().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
// --- [FIN DE REFACTORIZACIÓN SOBERANA] ---

export const BaviManifestSchema = z.object({
  assets: z.array(BaviAssetSchema),
});

export type BaviAsset = z.infer<typeof BaviAssetSchema>;
export type BaviManifest = z.infer<typeof BaviManifestSchema>;
export type BaviVariant = z.infer<typeof BaviVariantSchema>;
