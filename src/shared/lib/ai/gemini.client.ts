// RUTA: src/shared/lib/ai/gemini.client.ts
/**
 * @file gemini.client.ts
 * @description Cliente de servidor soberano para interactuar con la API de Google Gemini.
 * @version 1.1.0 (ActionResult Contract Alignment)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/shared/lib/logging";
import { GenerateTextRequestSchema } from "./gemini.schemas";
import type { GenerateTextRequest } from "./gemini.schemas";
import type { ActionResult } from "@/shared/lib/types/actions.types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  const errorMsg =
    "CRÍTICO: La variable de entorno GEMINI_API_KEY no está definida.";
  logger.error(`[GeminiClient] ${errorMsg}`);
  throw new Error(errorMsg);
}

class GeminiClient {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    logger.trace("[GeminiClient] Cliente de IA de Google inicializado.");
  }

  public async generateText(
    input: GenerateTextRequest
  ): Promise<ActionResult<string>> {
    const traceId = logger.startTrace(`gemini.generateText:${input.modelId}`);
    try {
      const validation = GenerateTextRequestSchema.safeParse(input);
      if (!validation.success) {
        return {
          success: false,
          error:
            validation.error.flatten().fieldErrors.prompt?.[0] ||
            "Petición inválida.",
        };
      }
      const { prompt, modelId } = validation.data;

      const model = this.genAI.getGenerativeModel({ model: modelId });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      logger.success("[GeminiClient] Texto generado con éxito.", { traceId });
      return { success: true, data: text };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido.";
      logger.error("[GeminiClient] Fallo al generar texto.", {
        error: errorMessage,
        traceId,
      });
      return {
        success: false,
        error: "La API de IA no pudo procesar la solicitud.",
      };
    } finally {
      logger.endTrace(traceId);
    }
  }
}

export const gemini = new GeminiClient(GEMINI_API_KEY);
