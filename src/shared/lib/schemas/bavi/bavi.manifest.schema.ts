// lib/schemas/bavi/bavi.manifest.schema.ts
/**
 * @file bavi.manifest.schema.ts
 * @description SSoT para el contrato de datos del manifiesto BAVI.
 * @version 2.0.0 (Timestamp Integration)
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
  // --- [INICIO] MEJORA ARQUITECTÓNICA ---
  createdAt: z.string().datetime().optional(), // Fecha de creación
  updatedAt: z.string().datetime().optional(), // Fecha de última modificación
  // --- [FIN] MEJORA ARQUITECTÓNICA ---
});

export const BaviManifestSchema = z.object({
  assets: z.array(BaviAssetSchema),
});

export type BaviAsset = z.infer<typeof BaviAssetSchema>;
export type BaviManifest = z.infer<typeof BaviManifestSchema>;
// lib/schemas/bavi/bavi.manifest.schema.ts
