// RUTA: src/shared/lib/config/producer.config.ts
/**
 * @file producer.config.ts
 * @description Orquestador de Configuración y SSoT para el productor y tracking.
 *              v3.0.0 (Resilient Lazy Initialization): Refactorizado a una
 *              función memoizada para prevenir condiciones de carrera durante
 *              la carga de variables de entorno en el build de Next.js.
 * @version 3.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { logger } from "@/shared/lib/logging";

const ProducerConfigSchema = z.object({
  TRACKING_ENABLED: z.boolean(),
  ACTION_URL: z
    .string()
    .url("A URL do endpoint do produtor deve ser uma URL válida."),
  LANDING_ID: z.string().min(1, "O ID da Landing Page é obrigatório."),
  OFFER_ID: z.string().min(1, "O ID da Oferta é obrigatório."),
  TRACKING: z.object({
    YANDEX_METRIKA_ID: z.string().optional(),
    GOOGLE_ANALYTICS_ID: z.string().optional(),
    TRUFFLE_PIXEL_ID: z.string().optional(),
  }),
});

type ProducerConfig = z.infer<typeof ProducerConfigSchema>;

let cachedConfig: ProducerConfig | null = null;

/**
 * @function getProducerConfig
 * @description Lee, valida y devuelve la configuración del productor.
 *              Utiliza un patrón singleton para validar solo una vez.
 * @returns {ProducerConfig} La configuración validada.
 * @throws {Error} Si las variables de entorno son inválidas.
 */
export function getProducerConfig(): ProducerConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  logger.trace(
    "[ProducerConfig] Validando variables de entorno del productor..."
  );

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
      "❌ CONFIGURACIÓN DE AMBIENTE INVÁLIDA:",
      validation.error.flatten().fieldErrors
    );
    throw new Error(
      "Variáveis de ambiente do produtor ausentes ou inválidas. Verifique o arquivo .env e .env.example."
    );
  }

  logger.success(
    "[ProducerConfig] Configuración del productor validada y cacheada."
  );
  cachedConfig = validation.data;
  return cachedConfig;
}
