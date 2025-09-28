// RUTA: src/shared/lib/actions/cogniread/extractStudyDna.action.ts
/**
 * @file extractStudyDna.action.ts
 * @description Server Action para orquestar la extracción de StudyDNA
 *              utilizando el motor de IA TEMA.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import { gemini } from "@/shared/lib/ai/gemini.client";
import {
  StudyDnaSchema,
  type StudyDna,
} from "@/shared/lib/schemas/cogniread/article.schema";
import { GEMINI_MODELS } from "@/shared/lib/ai/models.config";

const modelIds = GEMINI_MODELS.map((m) => m.id) as [string, ...string[]];

const ExtractDnaInputSchema = z.object({
  studyText: z.string().min(100, "El texto del estudio es demasiado corto."),
  modelId: z.enum(modelIds),
});

type ExtractDnaInput = z.infer<typeof ExtractDnaInputSchema>;

let promptMasterCache: string | null = null;
async function getPromptMaster(): Promise<string> {
  if (promptMasterCache) return promptMasterCache;
  const filePath = path.join(
    process.cwd(),
    "prompts",
    "extrae-padronizadamente-estudio-cientifico.md"
  );
  promptMasterCache = await fs.readFile(filePath, "utf-8");
  return promptMasterCache;
}

export async function extractStudyDnaAction(
  input: ExtractDnaInput
): Promise<ActionResult<StudyDna>> {
  const traceId = logger.startTrace("extractStudyDnaAction");
  logger.info(
    "[CogniRead Action] Iniciando extracción de StudyDNA con TEMA...",
    { traceId }
  );

  try {
    const validation = ExtractDnaInputSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.flatten().fieldErrors.studyText?.[0] ||
          "Datos de entrada inválidos.",
      };
    }

    const { studyText, modelId } = validation.data;

    const promptMaster = await getPromptMaster();
    const finalPrompt = `${promptMaster}\n\n--- INICIO DEL TEXTO DEL ESTUDIO ---\n\n${studyText}\n\n--- FIN DEL TEXTO DEL ESTUDIO ---`;

    const result = await gemini.generateText({ prompt: finalPrompt, modelId });

    if (!result.success) {
      return result;
    }

    const rawJson = result.data.replace(/```json\n|```/g, "").trim();
    const parsedJson = JSON.parse(rawJson);

    const studyDnaValidation = StudyDnaSchema.safeParse(parsedJson);
    if (!studyDnaValidation.success) {
      logger.error(
        "[CogniRead Action] La respuesta de la IA no cumple con el StudyDnaSchema.",
        {
          errors: studyDnaValidation.error.flatten(),
          traceId,
        }
      );
      return {
        success: false,
        error:
          "La IA devolvió datos en un formato inesperado. Por favor, inténtalo de nuevo.",
      };
    }

    logger.success(
      "[CogniRead Action] StudyDNA extraído y validado con éxito.",
      { traceId }
    );
    return { success: true, data: studyDnaValidation.data };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "[CogniRead Action] Fallo crítico durante la extracción de StudyDNA.",
      {
        error: errorMessage,
        traceId,
      }
    );
    return {
      success: false,
      error: "No se pudo procesar la extracción del estudio.",
    };
  } finally {
    logger.endTrace(traceId);
  }
}
