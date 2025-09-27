// RUTA: src/shared/lib/config/producer.config.ts
/**
 * @file producer.config.ts
 * @description Orquestador de Configuración y SSoT para el productor y tracking.
 *              Este módulo es EXCLUSIVO DEL SERVIDOR.
 * @version 4.0.0 (Server-Only Hardening & Elite Observability)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server-only";

import { z } from "zod";
import { logger } from "@/shared/lib/logging";

logger.trace(
  "[ProducerConfig] Módulo de configuración del productor cargado (v4.0)."
);

const ProducerConfigSchema = z.object({
  TRACKING_ENABLED: z.boolean(),
  ACTION_URL: z
    .string()
    .url("La URL del endpoint del productor debe ser una URL válida."),
  LANDING_ID: z.string().min(1, "El ID de la Landing Page es obligatorio."),
  OFFER_ID: z.string().min(1, "El ID de la Oferta es obligatorio."),
  TRACKING: z.object({
    YANDEX_METRIKA_ID: z.string().optional(),
    GOOGLE_ANALYTICS_ID: z.string().optional(),
    TRUFFLE_PIXEL_ID: z.string().optional(),
  }),
});

type ProducerConfig = z.infer<typeof ProducerConfigSchema>;

let cachedConfig: ProducerConfig | null = null;

export function getProducerConfig(): ProducerConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configData = {
    TRACKING_ENABLED:
      process.env.NEXT_PUBLIC_PRODUCER_TRACKING_ENABLED === "enabled",
    ACTION_URL: process.env.NEXT_PUBLIC_PRODUCER_ACTION_URL,
    LANDING_ID: process.env.NEXT_PUBLIC_LANDING_ID,
    OFFER_ID: process.env.NEXT_PUBLIC_OFFER_ID,
    TRACKING: {
      YANDEX_METRIKA_ID: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID,
      GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
      TRUFFLE_PIXEL_ID: process.env.NEXT_PUBLIC_TRUFFLE_PIXEL_ID,
    },
  };

  const validation = ProducerConfigSchema.safeParse(configData);

  if (!validation.success) {
    logger.error(
      "❌ CONFIGURACIÓN DE ENTORNO INVÁLIDA:",
      validation.error.flatten().fieldErrors
    );
    throw new Error(
      "Variables de ambiente del productor ausentes o inválidas. Verifique el archivo .env y .env.example."
    );
  }

  cachedConfig = validation.data;
  return cachedConfig;
}
