
// Ruta correcta: src/shared/lib/actions/bavi/getBaviAssets.action.ts
/**
 * @file getBaviAssets.action.ts
 * @description Server Action para obtener una lista paginada y filtrada de activos de BAVI.
 * @version 1.2.0 (Sovereign Path Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { promises as fs } from "fs";
import path from "path";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import {
  BaviManifestSchema,
  type BaviManifest,
  type BaviAsset,
} from "@/shared/lib/schemas/bavi/bavi.manifest.schema";
import {
  BaviSearchIndexSchema,
  type BaviSearchIndex,
} from "@/shared/lib/schemas/bavi/bavi.search-index.schema";
import {
  RaZPromptsSesaTagsSchema,
  type RaZPromptsSesaTags,
} from "@/shared/lib/schemas/raz-prompts/atomic.schema";
import { z } from "zod";
import { normalizeKeywords } from "@/shared/lib/utils/search/keyword-normalizer";

const BAVI_MANIFEST_PATH = path.join(
  process.cwd(),
  "content/bavi/bavi.manifest.json"
);
const SEARCH_INDEX_PATH = path.join(
  process.cwd(),
  "content/bavi/bavi.search-index.json"
);

const GetBaviAssetsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  query: z.string().optional(),
  tags: RaZPromptsSesaTagsSchema.partial().optional(),
});

export type GetBaviAssetsInput = z.infer<typeof GetBaviAssetsInputSchema>;

export async function getBaviAssetsAction(
  input: GetBaviAssetsInput
): Promise<ActionResult<{ assets: BaviAsset[]; total: number }>> {
  const traceId = logger.startTrace("getBaviAssetsAction");
  try {
    const validatedInput = GetBaviAssetsInputSchema.safeParse(input);
    if (!validatedInput.success) {
      logger.error("[getBaviAssetsAction] Fallo de validación de entrada.", {
        errors: validatedInput.error.flatten(),
      });
      return { success: false, error: "Parámetros de búsqueda inválidos." };
    }

    const { page, limit, query, tags } = validatedInput.data;

    const baviManifestContent = await fs
      .readFile(BAVI_MANIFEST_PATH, "utf-8")
      .catch(() => '{ "assets": [] }');
    const baviManifest: BaviManifest = BaviManifestSchema.parse(
      JSON.parse(baviManifestContent)
    );

    const searchIndexContent = await fs
      .readFile(SEARCH_INDEX_PATH, "utf-8")
      .catch(() => '{ "version": "1.0.0", "index": {} }');
    const baviSearchIndex: BaviSearchIndex = BaviSearchIndexSchema.parse(
      JSON.parse(searchIndexContent)
    );

    let filteredAssets = baviManifest.assets;

    if (tags) {
      filteredAssets = filteredAssets.filter((asset) => {
        for (const key in tags) {
          const tagValue = tags[key as keyof RaZPromptsSesaTags];
          if (
            tagValue &&
            asset.tags &&
            asset.tags[key as keyof RaZPromptsSesaTags] !== tagValue
          ) {
            return false;
          }
        }
        return true;
      });
    }

    if (query) {
      const normalizedQueryKeywords = normalizeKeywords(query.split(" "));
      filteredAssets = filteredAssets.filter((asset) => {
        const assetKeywords = baviSearchIndex.index[asset.assetId] || [];
        return normalizedQueryKeywords.some((qKeyword: string) =>
          assetKeywords.includes(qKeyword)
        );
      });
    }

    const total = filteredAssets.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedAssets = filteredAssets.slice(start, end);

    logger.success(
      `[getBaviAssetsAction] Activos obtenidos: ${paginatedAssets.length} de ${total}.`
    );
    logger.endTrace(traceId);
    return { success: true, data: { assets: paginatedAssets, total } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[getBaviAssetsAction] Fallo al obtener activos de BAVI.", {
      error: errorMessage,
    });
    logger.endTrace(traceId);
    return {
      success: false,
      error: "No se pudieron cargar los activos de BAVI.",
    };
  }
}
// Ruta correcta: src/shared/lib/actions/bavi/getBaviAssets.action.ts
