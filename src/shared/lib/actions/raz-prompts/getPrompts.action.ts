// RUTA: src/shared/lib/actions/raz-prompts/getPrompts.action.ts
/**
 * @file getPrompts.action.ts
 * @description Server Action de élite que actúa como un Agregador de Datos.
 *              Obtiene prompts y los enriquece con datos de la BAVI desde Supabase.
 * @version 9.0.0 (Migración Completa a Supabase)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { z } from "zod";
import { createServerClient } from "@/shared/lib/supabase/server";
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

// --- Tipos internos para la respuesta de Supabase (snake_case) ---
interface SupabasePromptVersion {
  version: number;
  promptText: string;
  negativePrompt?: string;
  parameters: any; // JSONB, se validará con Zod después
  createdAt: string;
}

interface SupabaseRaZPromptsSesaTags {
  ai: string;
  sty?: string;
  fmt?: string;
  typ?: string;
  sbj?: string;
}

interface SupabaseRaZPromptsEntry {
  id: string; // UUID from Supabase, corresponds to Zod's promptId
  user_id: string;
  workspace_id: string;
  title: string;
  status: "pending_generation" | "generated" | "archived";
  ai_service: string;
  keywords: string[]; // text[]
  versions: SupabasePromptVersion[]; // JSONB
  tags: SupabaseRaZPromptsSesaTags; // JSONB
  bavi_asset_ids: string[]; // text[]
  created_at: string;
  updated_at: string;
}
// --- Fin de tipos internos de Supabase ---

const GetPromptsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(9),
  query: z.string().optional(),
  tags: RaZPromptsSesaTagsSchema.partial().optional(),
});

export type GetPromptsInput = z.infer<typeof GetPromptsInputSchema>;

// Función de mapeo para transformar de Supabase (snake_case) a nuestro schema (camelCase)
function mapSupabaseToRaZPromptsEntry(
  supabaseEntry: SupabaseRaZPromptsEntry
): RaZPromptsEntry {
  return {
    promptId: supabaseEntry.id,
    userId: supabaseEntry.user_id,
    workspaceId: supabaseEntry.workspace_id,
    title: supabaseEntry.title,
    status: supabaseEntry.status,
    aiService: supabaseEntry.ai_service,
    keywords: supabaseEntry.keywords,
    versions: supabaseEntry.versions as any, // Ya validado por Zod, pero el tipo JSONB requiere aserción
    tags: supabaseEntry.tags as any, // Ya validado por Zod
    baviAssetIds: supabaseEntry.bavi_asset_ids,
    createdAt: supabaseEntry.created_at,
    updatedAt: supabaseEntry.updated_at,
  };
}

export async function getPromptsAction(
  input: GetPromptsInput
): Promise<
  ActionResult<{ prompts: EnrichedRaZPromptsEntry[]; total: number }>
> {
  const traceId = logger.startTrace("getPromptsAction_v9.0_Supabase");
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- GUARDIA DE SEGURIDAD SOBERANA ---
  if (!user) {
    logger.warn("[Action] Intento no autorizado de obtener prompts.", {
      traceId,
    });
    return { success: false, error: "auth_required" };
  }
  logger.info(
    `[Action] Obteniendo prompts para usuario: ${user.id} (página ${input.page})`,
    { traceId }
  );

  try {
    const validatedInput = GetPromptsInputSchema.safeParse(input);
    if (!validatedInput.success) {
      logger.warn("[Action] Parámetros de búsqueda inválidos.", {
        errors: validatedInput.error.flatten(),
        traceId,
      });
      return { success: false, error: "Parámetros de búsqueda inválidos." };
    }

    const { page, limit, query, tags } = validatedInput.data;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let queryBuilder = supabase
      .from("razprompts_entries")
      .select("*, count()", { count: "exact" }) // count: 'exact' para obtener el total
      .eq("user_id", user.id); // Asegura que solo se obtengan los prompts del usuario

    // Aplicar filtro de búsqueda de texto (simplificado)
    if (query) {
      // Buscar en el título y en las palabras clave (convirtiendo el array a texto)
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,keywords.cs.{${query.split(" ").join(",")}}`
      );
    }

    // Aplicar filtros de tags (JSONB)
    if (tags && Object.keys(tags).length > 0) {
      // Supabase .contains() requiere un objeto JSON para JSONB
      // Esto filtra si el campo JSONB 'tags' contiene el sub-objeto especificado.
      queryBuilder = queryBuilder.contains("tags", tags);
    }

    const { data, error, count } = await queryBuilder
      .order("updated_at", { ascending: false }) // Ordenar por la actualización más reciente
      .range(start, end);

    if (error) {
      logger.error("[Action] Error al obtener prompts de Supabase.", {
        error: error.message,
        traceId,
      });
      throw new Error(error.message);
    }

    // Mapear y validar los datos de Supabase a nuestro schema RaZPromptsEntry
    const mappedPrompts: RaZPromptsEntry[] = (data || []).map(
      mapSupabaseToRaZPromptsEntry
    );
    const validation = z.array(RaZPromptsEntrySchema).safeParse(mappedPrompts);

    if (!validation.success) {
      logger.error(
        "[Action] Los datos de prompts de Supabase son inválidos según el esquema de Zod.",
        {
          errors: validation.error.flatten(),
          traceId,
        }
      );
      throw new Error(
        "Formato de datos de prompts inesperado desde la base de datos."
      );
    }
    const validatedPrompts = validation.data;

    // Enriquecer con primaryImageUrl desde el manifiesto BAVI
    const baviManifest = await getBaviManifest();
    const enrichedPrompts = validatedPrompts.map(
      (prompt): EnrichedRaZPromptsEntry => {
        // Asumimos que `baviAssetIds` en el esquema RaZPromptsEntry es un array de strings.
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

    logger.success(
      `[Action] Prompts obtenidos: ${enrichedPrompts.length} de ${count ?? 0}.`,
      { traceId }
    );
    return {
      success: true,
      data: { prompts: enrichedPrompts, total: count ?? 0 },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[Action] Fallo crítico al obtener prompts.", {
      error: errorMessage,
      traceId,
    });
    return {
      success: false,
      error: `No se pudieron cargar los prompts: ${errorMessage}`,
    };
  } finally {
    logger.endTrace(traceId);
  }
}
