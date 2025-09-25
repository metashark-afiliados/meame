// RUTA: src/shared/lib/actions/raz-prompts/getPrompts.action.ts
/**
 * @file getPrompts.action.ts
 * @description Server Action de élite que actúa como un Agregador de Datos.
 *              Obtiene prompts y los enriquece con datos de la BAVI.
 * @version 7.1.0 (Definitive Type Safety)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { z } from "zod";
import { type Filter, type Document } from "mongodb";
import { connectToDatabase } from "@/shared/lib/mongodb";
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
import { createServerClient } from "@/shared/lib/supabase/server";
import { getBaviManifest } from "@/shared/lib/bavi";
import type {
  BaviAsset,
  BaviVariant,
} from "@/shared/lib/schemas/bavi/bavi.manifest.schema";

// --- INICIO DE REFACTORIZACIÓN DE ÉLITE: Contrato de Tipos Soberano ---

// Define el tipo para el payload de retorno enriquecido.
export type EnrichedRaZPromptsEntry = RaZPromptsEntry & {
  primaryImageUrl?: string;
};

// Define el tipo para las etapas del pipeline de agregación de MongoDB.
type MongoPipelineStage = Document;

const GetPromptsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(9),
  query: z.string().optional(),
  tags: RaZPromptsSesaTagsSchema.partial().optional(),
});

export type GetPromptsInput = z.infer<typeof GetPromptsInputSchema>;

// Contrato para la estructura de respuesta de la agregación con $facet.
interface PromptsAggregationResult {
  totalCount: [{ count: number }];
  prompts: RaZPromptsEntry[];
}
// --- FIN DE REFACTORIZACIÓN DE ÉLITE ---

export async function getPromptsAction(
  input: GetPromptsInput
): Promise<
  ActionResult<{ prompts: EnrichedRaZPromptsEntry[]; total: number }>
> {
  const traceId = logger.startTrace("getPromptsAction_v7.1");
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "auth_required" };

    const { page, limit, query, tags } = GetPromptsInputSchema.parse(input);
    logger.traceEvent(traceId, "Parámetros de entrada validados.", { input });

    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection<RaZPromptsEntry>("prompts");

    const matchStage: Filter<RaZPromptsEntry> = { userId: user.id };
    if (query) {
      matchStage.$text = { $search: query };
    }
    if (tags && Object.keys(tags).length > 0) {
      for (const key in tags) {
        matchStage[`tags.${key}`] = tags[key as keyof RaZPromptsSesaTags];
      }
    }
    logger.traceEvent(traceId, "Etapa $match construida.", { matchStage });

    const skip = (page - 1) * limit;

    // --- INICIO DE REFACTORIZACIÓN DE ÉLITE: Tipado Explícito del Pipeline ---
    const pipeline: MongoPipelineStage[] = [
      { $match: matchStage },
      { $sort: { updatedAt: -1 } },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          prompts: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];
    // --- FIN DE REFACTORIZACIÓN DE ÉLITE ---

    const result = await collection
      .aggregate<PromptsAggregationResult>(pipeline)
      .toArray();

    const promptsFromDb = result[0]?.prompts ?? [];
    const total = result[0]?.totalCount[0]?.count ?? 0;
    logger.traceEvent(traceId, "Agregación de MongoDB completada.", {
      found: total,
    });

    // --- LÓGICA DE ENRIQUECIMIENTO ---
    const baviManifest = await getBaviManifest();
    const enrichedPrompts = promptsFromDb.map(
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
    logger.traceEvent(traceId, "Enriquecimiento de datos con BAVI completado.");

    logger.success(
      `[getPromptsAction] Prompts enriquecidos obtenidos: ${enrichedPrompts.length} de ${total}.`
    );
    return { success: true, data: { prompts: enrichedPrompts, total } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[getPromptsAction] Fallo crítico.", {
      error: errorMessage,
    });
    return {
      success: false,
      error: "No se pudieron cargar los prompts.",
    };
  } finally {
    logger.endTrace(traceId);
  }
}
