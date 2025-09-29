// RUTA: src/shared/lib/schemas/bavi/bavi.manifest.schema.ts
/**
 * @file bavi.manifest.schema.ts
 * @description SSoT para el contrato de datos del manifiesto BAVI.
 * @version 4.0.0 (Holistic & Unabbreviated)
 * @author L.I.A. Legacy
 */
import { z } from "zod";

// Sigue utilizando los valores de SESA, pero las claves ahora son descriptivas.
const SesaTagsDescriptiveSchema = z.object({
  aiEngine: z.string().optional(),
  visualStyle: z.string().optional(),
  aspectRatio: z.string().optional(),
  assetType: z.string().optional(),
  subject: z.string().optional(),
});

const BaviVariantSchema = z.object({
  versionId: z.string(),
  publicId: z.string(),
  state: z.enum(["orig", "enh"]),
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
  }),
});

export const BaviAssetSchema = z.object({
  assetId: z.string(),
  status: z.enum(["active", "archived", "pending"]),
  provider: z.enum(["cloudinary"]),
  description: z.string().optional(),
  tags: SesaTagsDescriptiveSchema.optional(),
  variants: z.array(BaviVariantSchema).min(1),
  metadata: z.object({
    altText: z.record(z.string()),
  }),
  promptId: z.string().cuid2().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const BaviManifestSchema = z.object({
  assets: z.array(BaviAssetSchema),
});

export type BaviAsset = z.infer<typeof BaviAssetSchema>;
export type BaviManifest = z.infer<typeof BaviManifestSchema>;
export type BaviVariant = z.infer<typeof BaviVariantSchema>;
