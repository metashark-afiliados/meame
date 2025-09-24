// Ruta correcta: src/shared/lib/actions/bavi/addAssetToManifests.action.ts
/**
 * @file addAssetToManifests.action.ts
 * @description Server Action atómica para registrar un nuevo activo en los manifiestos de BAVI.
 * @version 3.1.0 (Sovereign Path Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { promises as fs } from "fs";
import path from "path";
import type { UploadApiResponse } from "cloudinary";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import type { AssetUploadMetadata } from "@/shared/lib/schemas/bavi/upload.schema";
import { connectToDatabase } from "@/shared/lib/mongodb";
import type { RaZPromptsEntry } from "@/shared/lib/schemas/raz-prompts/entry.schema";
import { normalizeKeywords } from "@/shared/lib/utils/search/keyword-normalizer";

const BAVI_MANIFEST_PATH = path.join(
  process.cwd(),
  "content/bavi/bavi.manifest.json"
);
const SEARCH_INDEX_PATH = path.join(
  process.cwd(),
  "content/bavi/bavi.search-index.json"
);

export async function addAssetToManifestsAction(
  metadata: AssetUploadMetadata,
  cloudinaryResponse: UploadApiResponse
): Promise<ActionResult<{ assetId: string }>> {
  try {
    const baviManifestContent = await fs
      .readFile(BAVI_MANIFEST_PATH, "utf-8")
      .catch(() => '{ "assets": [] }');
    const baviManifest = JSON.parse(baviManifestContent);
    const now = new Date().toISOString();

    const newAssetEntry = {
      assetId: metadata.assetId,
      provider: "cloudinary",
      promptId: metadata.promptId,
      tags: metadata.sesaTags,
      variants: [
        {
          versionId: "v1-orig",
          publicId: cloudinaryResponse.public_id,
          state: "orig",
          dimensions: {
            width: cloudinaryResponse.width,
            height: cloudinaryResponse.height,
          },
        },
      ],
      metadata: {
        altText: metadata.altText,
      },
      imageUrl: metadata.promptId ? cloudinaryResponse.secure_url : undefined,
      createdAt: now,
      updatedAt: now,
    };

    baviManifest.assets.push(newAssetEntry);
    await fs.writeFile(
      BAVI_MANIFEST_PATH,
      JSON.stringify(baviManifest, null, 2)
    );
    logger.success(
      `[addAssetToManifests] Activo ${metadata.assetId} añadido a bavi.manifest.json`
    );

    const searchIndexContent = await fs
      .readFile(SEARCH_INDEX_PATH, "utf-8")
      .catch(() => '{ "version": "1.0.0", "index": {} }');
    const searchIndex = JSON.parse(searchIndexContent);

    searchIndex.index[metadata.assetId] = normalizeKeywords(metadata.keywords);

    await fs.writeFile(SEARCH_INDEX_PATH, JSON.stringify(searchIndex, null, 2));
    logger.success(
      `[addAssetToManifests] Activo ${metadata.assetId} añadido a bavi.search-index.json`
    );

    if (metadata.promptId && cloudinaryResponse.secure_url) {
      const client = await connectToDatabase();
      const db = client.db(process.env.MONGODB_DB_NAME);
      const collection = db.collection<RaZPromptsEntry>("prompts");

      await collection.updateOne(
        { promptId: metadata.promptId },
        { $set: { imageUrl: cloudinaryResponse.secure_url } }
      );
      logger.success(
        `[addAssetToManifests] imageUrl añadida a prompt ${metadata.promptId} en MongoDB.`
      );
    }

    return { success: true, data: { assetId: metadata.assetId } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[addAssetToManifests] Fallo al actualizar los manifiestos.", {
      error: errorMessage,
    });
    return {
      success: false,
      error: "No se pudieron actualizar los manifiestos de la BAVI.",
    };
  }
}
// Ruta correcta: src/shared/lib/actions/bavi/addAssetToManifests.action.ts
