// RUTA: src/shared/lib/ai/models.config.ts
/**
 * @file models.config.ts
 * @description SSoT para los modelos de IA de Gemini disponibles en el ecosistema.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

export interface GeminiModel {
  id: string;
  name: string;
  description: string;
  contextWindow: number;
}

export const GEMINI_MODELS: readonly GeminiModel[] = [
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    description:
      "El modelo más rápido y rentable para tareas de alta frecuencia.",
    contextWindow: 1048576,
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    description:
      "Modelo balanceado para una amplia gama de tareas de texto y código.",
    contextWindow: 30720,
  },
] as const;

