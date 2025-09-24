// app/[locale]/(dev)/raz-prompts/_actions/getPrompts.action.ts
/**
 * @file getPrompts.action.ts
 * @description Server Action de élite para obtener una lista paginada y filtrada de prompts para el usuario autenticado.
 * @version 5.0.0 (Supabase User Integration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { z } from "zod";
import { type Filter } from "mongodb";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { type RaZPromptsEntry } from "@/shared/lib/schemas/raz-prompts/entry.schema";
import {
  RaZPromptsSesaTagsSchema,
  type RaZPromptsSesaTags,
} from "@/shared/lib/schemas/raz-prompts/atomic.schema";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { logger } from "@/shared/lib/logging";
import { createServerClient } from "@/shared/lib/supabase/server"; // Importar cliente de Supabase

const GetPromptsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(9),
  query: z.string().optional(),
  tags: RaZPromptsSesaTagsSchema.partial().optional(),
});

export type GetPromptsInput = z.infer<typeof GetPromptsInputSchema>;

interface PromptsAggregationResult {
  totalCount: [{ count: number }];
  prompts: RaZPromptsEntry[];
}

export async function getPromptsAction(
  input: GetPromptsInput
): Promise<ActionResult<{ prompts: RaZPromptsEntry[]; total: number }>> {
  const traceId = logger.startTrace("getPromptsAction");
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.warn(
        "[getPromptsAction] Intento de obtener prompts sin autenticación."
      );
      return { success: false, error: "auth_required" }; // O devolver un array vacío si es preferible
    }

    const validatedInput = GetPromptsInputSchema.safeParse(input);
    if (!validatedInput.success) {
      const errorDetails = validatedInput.error.flatten();
      logger.error("[getPromptsAction] Fallo de validación de entrada.", {
        errors: errorDetails,
      });
      return { success: false, error: "Parámetros de búsqueda inválidos." };
    }

    const { page, limit, query, tags } = validatedInput.data;
    logger.trace("[getPromptsAction] Parámetros validados.", {
      input,
      userId: user.id,
    });

    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection<RaZPromptsEntry>("prompts");

    const matchStage: Filter<RaZPromptsEntry> = { userId: user.id }; // Filtrar por el ID de usuario real

    if (query && query.trim() !== "") {
      const searchRegex = new RegExp(query.trim(), "i");
      matchStage.$or = [
        { title: searchRegex },
        { "versions.promptText": searchRegex },
        { keywords: searchRegex },
      ];
      logger.trace("[getPromptsAction] Filtro de búsqueda de texto aplicado.", {
        query,
      });
    }

    if (tags && Object.keys(tags).length > 0) {
      for (const key in tags) {
        const typedKey = key as keyof RaZPromptsSesaTags;
        const tagValue = tags[typedKey];
        if (tagValue) {
          // Asegurarse de que `tags` en la DB tenga la misma estructura
          matchStage[`tags.${typedKey}`] = tagValue;
        }
      }
      logger.trace("[getPromptsAction] Filtros SESA aplicados.", { tags });
    }

    const pipeline = [
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
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

    const prompts = result[0]?.prompts ?? [];
    const total = result[0]?.totalCount[0]?.count ?? 0;

    logger.success(
      `[getPromptsAction] Prompts obtenidos con éxito: ${prompts.length} de ${total} para usuario: ${user.id}.`
    );
    return { success: true, data: { prompts, total } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[getPromptsAction] Fallo crítico al obtener prompts.", {
      error: errorMessage,
    });
    return { success: false, error: "No se pudieron cargar los prompts." };
  } finally {
    logger.endTrace(traceId);
  }
}
