// RUTA: scripts/seeding/seed-bavi.ts
/**
 * @file seed-bavi.ts
 * @description Script de "siembra" para poblar las tablas de la BAVI en Supabase.
 * @version 4.1.0 (Auth-Aware & Resilient)
 * @author L.I.A. Legacy
 */
import { promises as fs } from "fs";
import * as path from "path";
import { createScriptClient } from "../../src/shared/lib/supabase/script-client";
import { BaviManifestSchema } from "../../src/shared/lib/schemas/bavi/bavi.manifest.schema";
import { logger } from "../../src/shared/lib/logging";
import type { ActionResult } from "../../src/shared/lib/types/actions.types";

async function seedBavi(): Promise<ActionResult<{ seededAssets: number }>> {
  const traceId = logger.startTrace("seedBavi_v4.1");
  logger.startGroup(
    "🌱 Iniciando siembra de DB para BAVI v4.1 (Auth-Aware)..."
  );

  try {
    const supabaseAdmin = createScriptClient();
    const superUserEmail = "superuser@webvork.dev";

    // --- [INICIO DE REFACTORIZACIÓN DE CAUSA RAÍZ] ---
    // Se utiliza el método correcto para buscar al usuario en el esquema 'auth'.
    const {
      data: { users },
      error: userError,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (userError) {
      throw new Error(`Error al listar usuarios: ${userError.message}`);
    }

    const superUser = users.find((user) => user.email === superUserEmail);

    if (!superUser) {
      throw new Error(
        `Superusuario con email '${superUserEmail}' no encontrado. Ejecuta primero 'pnpm db:seed:superuser'.`
      );
    }
    const superUserId = superUser.id;
    logger.success(`Superusuario encontrado. ID: ${superUserId}`);
    // --- [FIN DE REFACTORIZACIÓN DE CAUSA RAÍZ] ---

    const manifestPath = path.join(
      process.cwd(),
      "content/bavi/bavi.manifest.json"
    );
    const manifestContent = await fs.readFile(manifestPath, "utf-8");
    const manifest = BaviManifestSchema.parse(JSON.parse(manifestContent));

    logger.info(
      `Se encontraron ${manifest.assets.length} activos en el manifiesto para sembrar.`
    );
    let seededCount = 0;

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
            user_id: superUserId, // Se asigna el ID correcto.
            workspace_id: null,
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
      seededCount++;

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
    logger.endTrace(traceId);
    return { success: true, data: { seededAssets: seededCount } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("Fallo catastrófico en el script de siembra de BAVI.", {
      error: errorMessage,
      traceId,
    });
    logger.endGroup();
    logger.endTrace(traceId);
    return { success: false, error: errorMessage };
  }
}

export default seedBavi;
