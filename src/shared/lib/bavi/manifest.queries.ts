// RUTA: src/shared/lib/bavi/manifest.queries.ts
/**
 * @file manifest.queries.ts
 * @description SSoT para las operaciones de lectura de la BAVI desde Supabase.
 *              v5.0.0 (Resilient Parsing & Elite Observability): Inyectado con
 *              guardianes de resiliencia. Ahora utiliza `safeParse` para ignorar
 *              activos corruptos y registrarlos, previniendo fallos de renderizado.
 * @version 5.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
//import "server-only";
import * as React from "react";
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

const getBaviManifestFn = async (): Promise<BaviManifest> => {
  const traceId = logger.startTrace("getBaviManifestFn_v5.0_Resilient");
  logger.trace("[BAVI DAL v5.0] Solicitando manifiesto desde Supabase...");
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
      traceId,
    });
    throw new Error(
      "No se pudo cargar la biblioteca de activos visuales desde Supabase."
    );
  }

  const validAssets: BaviAsset[] = [];

  for (const asset of assetsData as SupabaseBaviAsset[]) {
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

    // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
    const validation = BaviAssetSchema.safeParse(transformedAsset);
    if (validation.success) {
      validAssets.push(validation.data);
    } else {
      logger.error(
        `[BAVI DAL] Activo corrupto ignorado en la base de datos. assetId: ${asset.asset_id}`,
        {
          error: validation.error.flatten(),
          traceId,
        }
      );
    }
    // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---
  }

  logger.success(
    `[BAVI DAL v5.0] Manifiesto ensamblado con ${validAssets.length} activos válidos (de ${assetsData.length} encontrados).`
  );
  logger.endTrace(traceId);
  return { assets: validAssets };
};

export const getBaviManifest =
  typeof React.cache === "function"
    ? React.cache(getBaviManifestFn)
    : getBaviManifestFn;
