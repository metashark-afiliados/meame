// RUTA: scripts/seeding/seed-bavi.ts
/**
 * @file seed-bavi.ts
 * @description Script de "siembra" para poblar las tablas de la BAVI en Supabase.
 * @version 2.0.0 (Holistic Build Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
import { promises as fs } from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import { BaviManifestSchema } from "../../src/shared/lib/schemas/bavi/bavi.manifest.schema";
import { logger } from "../../src/shared/lib/logging";
import { loadEnvironment } from "../supabase/_utils";

async function seedBavi() {
  logger.startGroup("🌱 Iniciando siembra de DB para BAVI v2.0...");
  loadEnvironment();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Las variables de entorno de Supabase no están configuradas."
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
  const manifestPath = path.join(
    process.cwd(),
    "content/bavi/bavi.manifest.json"
  );
  const manifestContent = await fs.readFile(manifestPath, "utf-8");
  const manifest = BaviManifestSchema.parse(JSON.parse(manifestContent));

  logger.info(
    `Se encontraron ${manifest.assets.length} activos en el manifiesto para sembrar.`
  );

  for (const asset of manifest.assets) {
    const { error: assetError } = await supabaseAdmin
      .from("bavi_assets")
      .upsert(
        {
          asset_id: asset.assetId,
          provider: asset.provider,
          prompt_id: asset.promptId,
          tags: asset.tags,
          metadata: asset.metadata,
        },
        { onConflict: "asset_id" }
      );

    if (assetError) {
      logger.error(`Error al sembrar el activo ${asset.assetId}:`, {
        error: assetError,
      });
      continue;
    }

    logger.success(`Activo ${asset.assetId} sembrado/actualizado.`);

    for (const variant of asset.variants) {
      const { error: variantError } = await supabaseAdmin
        .from("bavi_variants")
        .upsert(
          {
            variant_id: variant.versionId,
            asset_id: asset.assetId,
            public_id: variant.publicId,
            state: variant.state,
            width: variant.dimensions.width,
            height: variant.dimensions.height,
          },
          { onConflict: "variant_id" }
        );

      if (variantError) {
        logger.error(
          `Error al sembrar la variante ${variant.versionId} para el activo ${asset.assetId}:`,
          { error: variantError }
        );
      } else {
        logger.trace(`  └─ Variante ${variant.versionId} sembrada.`);
      }
    }
  }

  logger.endGroup();
}

seedBavi().catch((error) => {
  logger.error("Fallo catastrófico en el script de siembra de BAVI.", {
    error,
  });
  process.exit(1);
});
