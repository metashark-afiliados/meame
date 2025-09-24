// lib/bavi/upload.schema.ts
/**
 * @file upload.schema.ts
 * @description SSoT para los metadatos de subida a Cloudinary.
 * @version 2.0.0 (Manifest & Prompt Linking)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { RaZPromptsSesaTagsSchema } from "@/shared/lib/schemas/raz-prompts/atomic.schema"; // Reutilizamos el SESA

export const assetUploadMetadataSchema = z.object({
  assetId: z.string().min(1, "Se requiere un assetId único."),
  // Folksonomía para el índice de búsqueda
  keywords: z.array(z.string()),
  // Taxonomía para el manifiesto principal
  sesaTags: RaZPromptsSesaTagsSchema.partial(), // Hacemos parcial para flexibilidad
  // Metadatos de accesibilidad
  altText: z.record(z.string()), // ej. { "it-IT": "..." }
  // Conexión opcional a RaZPrompts
  promptId: z.string().optional(),
});

export type AssetUploadMetadata = z.infer<typeof assetUploadMetadataSchema>;
// lib/bavi/upload.schema.ts
