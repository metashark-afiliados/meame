// RUTA: src/shared/lib/actions/raz-prompts/getPrompts.action.ts
/**
 * @file getPrompts.action.ts
 * @description Server Action de élite que actúa como un Agregador de Datos.
 *              Obtiene prompts y los enriquece con datos de la BAVI.
 * @version 8.0.0 (Production-Ready User Context)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { z } from "zod";
import { type Filter, type Document } from "mongodb";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { createServerClient } from "@/shared/lib/supabase/server"; // <-- IMPORTACIÓN CLAVE
import {
  RaZPromptsEntrySchema,
  type RaZPromptsEntry,
} from "@/shared/lib/schemas/raz-prompts/entry.schema";
import {
  RaZPromptsSesaTagsSchema,
  type RaZPromptsSesaTags,
} from "@/shared/lib/schemas/raz-prompts/atomic.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";
import { getBaviManifest } from "@/shared/lib/bavi";
import type {
  BaviAsset,
  BaviVariant,
} from "@/shared/lib/schemas/bavi/bavi.manifest.schema";

export type EnrichedRaZPromptsEntry = RaZPromptsEntry & {
  primaryImageUrl?: string;
};

type MongoPipelineStage = Document;

const GetPromptsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(9),
  query: z.string().optional(),
  tags: RaZPromptsSesaTagsSchema.partial().optional(),
});

export type GetPromptsInput = z.infer<typeof GetPromptsInputSchema>;

interface PromptsAggregationResult {
  totalCount: [{ count: number }];
  prompts: Document[];
}

export async function getPromptsAction(
  input: GetPromptsInput
): Promise<
  ActionResult<{ prompts: EnrichedRaZPromptsEntry[]; total: number }>
> {
  const traceId = logger.startTrace("getPromptsAction_v8.0");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- GUARDIA DE SEGURIDAD SOBERANA ---
  if (!user) {
    return { success: false, error: "auth_required" };
  }

  try {
    const { page, limit, query, tags } = GetPromptsInputSchema.parse(input);
    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection<RaZPromptsEntry>("prompts");

    // --- LÓGICA DE PRODUCCIÓN ---
    // El `matchStage` ahora es seguro y contextual al usuario.
    const matchStage: Filter<RaZPromptsEntry> = { userId: user.id };
    if (query) matchStage.$text = { $search: query };
    if (tags && Object.keys(tags).length > 0) {
      for (const key in tags) {
        matchStage[`tags.${key}`] = tags[key as keyof RaZPromptsSesaTags];
      }
    }

    const pipeline: MongoPipelineStage[] = [
      { $match: matchStage },
      { $sort: { updatedAt: -1 } },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          prompts: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ];

    const result = await collection
      .aggregate<PromptsAggregationResult>(pipeline)
      .toArray();
    const promptsFromDb = result[0]?.prompts ?? [];
    const total = result[0]?.totalCount[0]?.count ?? 0;

    const validation = z.array(RaZPromptsEntrySchema).safeParse(promptsFromDb);
    if (!validation.success) {
      logger.error("[getPromptsAction] Datos de prompts corruptos en la DB.", {
        error: validation.error.flatten(),
        traceId,
      });
      throw new Error("Los datos de la base de datos no son válidos.");
    }
    const validatedPrompts = validation.data;

    const baviManifest = await getBaviManifest();
    const enrichedPrompts = validatedPrompts.map(
      (prompt): EnrichedRaZPromptsEntry => {
        const primaryAssetId = prompt.baviAssetIds?.[0];
        if (!primaryAssetId) return prompt;
        const asset = baviManifest.assets.find(
          (a: BaviAsset) => a.assetId === primaryAssetId
        );
        const publicId = asset?.variants.find(
          (v: BaviVariant) => v.state === "orig"
        )?.publicId;
        if (!publicId) return prompt;
        return {
          ...prompt,
          primaryImageUrl: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_400/${publicId}`,
        };
      }
    );

    return { success: true, data: { prompts: enrichedPrompts, total } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[getPromptsAction] Fallo crítico.", {
      error: errorMessage,
      traceId,
    });
    return { success: false, error: "No se pudieron cargar los prompts." };
  } finally {
    logger.endTrace(traceId);
  }
}
