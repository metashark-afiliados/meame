// RUTA: src/shared/lib/bavi/manifest.queries.ts
/**
 * @file manifest.queries.ts
 * @description SSoT para las operaciones de lectura de la BAVI desde Supabase.
 * @version 4.0.0 (Environment-Aware & Isomorphic)
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import * as React from "react"; // Importar como espacio de nombres
import { createServerClient } from "@/shared/lib/supabase/server";
import { logger } from "@/shared/lib/logging";
import {
  BaviAssetSchema,
  type BaviAsset,
  type BaviManifest,
} from "@/shared/lib/schemas/bavi/bavi.manifest.schema";
import type { RaZPromptsSesaTags } from "@/shared/lib/schemas/raz-prompts/atomic.schema";

// --- Tipos internos para la respuesta de Supabase ---
interface SupabaseBaviVariant {
  variant_id: string;
  public_id: string;
  state: "orig" | "enh";
  width: number;
  height: number;
}

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
// --- Fin de tipos internos ---

// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: LÓGICA PURA AISLADA] ---
/**
 * @function getBaviManifestFn
 * @description La función pura y sin caché para obtener y transformar los datos.
 *              Es segura para ser ejecutada en cualquier entorno de Node.js.
 * @private
 */
const getBaviManifestFn = async (): Promise<BaviManifest> => {
  logger.trace("[BAVI DAL v4.0] Solicitando manifiesto desde Supabase...");
  const supabase = createServerClient();

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

  const reshapedAssets: BaviAsset[] = assetsData.map(
    (asset: SupabaseBaviAsset) => {
      const transformedAsset = {
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
        metadata: asset.metadata ?? { altText: {} },
        createdAt: asset.created_at,
        updatedAt: asset.updated_at,
      };
      return BaviAssetSchema.parse(transformedAsset);
    }
  );

  logger.success(
    `[BAVI DAL v4.0] Manifiesto ensamblado con ${reshapedAssets.length} activos.`
  );
  return { assets: reshapedAssets };
};
// --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

/**
 * @export getBaviManifest
 * @description Exportación pública y consciente del entorno.
 *              Aplica la optimización de caché de React solo si está disponible.
 */
export const getBaviManifest =
  typeof React.cache === "function"
    ? React.cache(getBaviManifestFn)
    : getBaviManifestFn;
