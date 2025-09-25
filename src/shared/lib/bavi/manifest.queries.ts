// RUTA: src/shared/lib/bavi/manifest.queries.ts
/**
 * @file manifest.queries.ts
 * @description SSoT para las operaciones de lectura de la BAVI desde Supabase.
 *              v2.1.0 (Type Safety Restoration): Elimina el uso de 'any',
 *              definiendo contratos de tipo explícitos para la respuesta de la
 *              base de datos y garantizando la seguridad de tipos de extremo a extremo.
 * @version 2.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import { cache } from "react";
import { createServerClient } from "@/shared/lib/supabase/server";
import { logger } from "@/shared/lib/logging";
import type {
  BaviAsset,
  BaviManifest,
  RaZPromptsSesaTags,
} from "@/shared/lib/schemas/bavi/bavi.manifest.schema";

// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: CONTRATOS DE DATOS SOBERANOS] ---
/**
 * @interface SupabaseBaviVariant
 * @description Modela la forma de una variante tal como es devuelta por la consulta a Supabase.
 */
interface SupabaseBaviVariant {
  variant_id: string;
  public_id: string;
  state: "orig" | "enh";
  width: number;
  height: number;
}

/**
 * @interface SupabaseBaviAsset
 * @description Modela la forma de un activo tal como es devuelto por la consulta a Supabase,
 *              incluyendo la relación anidada con sus variantes.
 */
interface SupabaseBaviAsset {
  asset_id: string;
  provider: "cloudinary";
  prompt_id: string | null;
  tags: Partial<RaZPromptsSesaTags> | null;
  metadata: { altText?: Record<string, string> } | null;
  created_at: string;
  updated_at: string;
  bavi_variants: SupabaseBaviVariant[];
}
// --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

export const getBaviManifest = cache(async (): Promise<BaviManifest> => {
  logger.trace("[BAVI DAL v2.1] Solicitando manifiesto desde Supabase...");
  const supabase = createServerClient();

  // TypeScript ahora sabe que `data` será un array de `SupabaseBaviAsset`
  const { data: assetsData, error: assetsError } = await supabase
    .from("bavi_assets")
    .select(
      `
      asset_id, provider, prompt_id, tags, metadata, created_at, updated_at,
      bavi_variants ( variant_id, public_id, state, width, height )
    `
    );

  if (assetsError) {
    logger.error("[BAVI DAL] Fallo al obtener activos de Supabase.", {
      error: assetsError,
    });
    throw new Error(
      "No se pudo cargar la biblioteca de activos visuales desde Supabase."
    );
  }

  // Se aplica el tipo explícito en el mapeo, eliminando la necesidad de `any`.
  const reshapedAssets: BaviAsset[] = assetsData.map(
    (asset: SupabaseBaviAsset) => ({
      assetId: asset.asset_id,
      provider: asset.provider,
      promptId: asset.prompt_id ?? undefined,
      tags: asset.tags ?? undefined,
      variants: asset.bavi_variants.map((v: SupabaseBaviVariant) => ({
        versionId: v.variant_id,
        publicId: v.public_id,
        state: v.state,
        dimensions: { width: v.width, height: v.height },
      })),
      metadata: asset.metadata ?? undefined,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
    })
  );

  logger.success(
    `[BAVI DAL v2.1] Manifiesto ensamblado con ${reshapedAssets.length} activos.`
  );
  return { assets: reshapedAssets };
});
