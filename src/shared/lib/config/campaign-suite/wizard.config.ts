// RUTA: src/shared/lib/config/campaign-suite/wizard.config.ts
/**
 * @file wizard.config.ts
 * @description SSoT para la configuración de metadata del asistente de la SDC.
 * @version 12.0.0 (Component Decoupling & Build Stability)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { logger } from "@/shared/lib/logging";
import {
  Step0ContentSchema,
  Step1ContentSchema,
  Step2ContentSchema,
  Step3ContentSchema,
  Step4ContentSchema,
  Step5ContentSchema,
} from "@/shared/lib/schemas/campaigns/steps";

logger.trace("[wizard.config] Cargando SDC v12.0 (Decoupled).");

// El contrato ahora solo define la metadata, no la implementación.
export interface StepDefinition<TContent extends z.ZodRawShape> {
  readonly id: number;
  readonly titleKey: string;
  readonly i18nPath: string;
  readonly schema: z.ZodObject<TContent>;
}

const createStep = <TContent extends z.ZodRawShape>(
  config: StepDefinition<TContent>
): StepDefinition<TContent> => config;

export const stepsConfig = [
  createStep({
    id: 0,
    titleKey: "Identificación",
    i18nPath: "messages/pages/dev/campaign-suite/steps/step0.i18n.json",
    schema: z.object({ step0: Step0ContentSchema }),
  }),
  createStep({
    id: 1,
    titleKey: "Estructura",
    i18nPath: "messages/pages/dev/campaign-suite/steps/step1.i18n.json",
    schema: z.object({ step1: Step1ContentSchema }),
  }),
  createStep({
    id: 2,
    titleKey: "Layout",
    i18nPath: "messages/pages/dev/campaign-suite/steps/step2.i18n.json",
    schema: z.object({ step2: Step2ContentSchema }),
  }),
  createStep({
    id: 3,
    titleKey: "Tema",
    i18nPath: "messages/pages/dev/campaign-suite/steps/step3.i18n.json",
    schema: z.object({ step3: Step3ContentSchema }),
  }),
  createStep({
    id: 4,
    titleKey: "Contenido",
    i18nPath: "messages/pages/dev/campaign-suite/steps/step4.i18n.json",
    schema: z.object({ step4: Step4ContentSchema }),
  }),
  createStep({
    id: 5,
    titleKey: "Gestión",
    i18nPath: "messages/pages/dev/campaign-suite/steps/step5.i18n.json",
    schema: z.object({ step5: Step5ContentSchema }),
  }),
] as const;

export type StepConfig = (typeof stepsConfig)[number];
