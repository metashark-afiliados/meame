// RUTA: src/shared/lib/schemas/bavi/bavi.manifest.schema.ts
/**
 * @file bavi.manifest.schema.ts
 * @description SSoT para el contrato de datos del manifiesto BAVI.
 * @version 2.1.0 (Type Export Fix)
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

const BaviAssetSchema = z.object({
  assetId: z.string(),
  provider: z.enum(["cloudinary"]),
  promptId: z.string().optional(),
  tags: RaZPromptsSesaTagsSchema.partial(),
  variants: z.array(BaviVariantSchema).min(1),
  metadata: z.object({
    altText: z.record(z.string()),
  }),
  imageUrl: z.string().url().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const BaviManifestSchema = z.object({
  assets: z.array(BaviAssetSchema),
});

export type BaviAsset = z.infer<typeof BaviAssetSchema>;
export type BaviManifest = z.infer<typeof BaviManifestSchema>;
// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
// Se exporta el tipo inferido desde el schema, resolviendo el error TS2305.
export type BaviVariant = z.infer<typeof BaviVariantSchema>;
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---
