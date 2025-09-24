// Ruta correcta: src/shared/lib/config/campaign-suite/wizard.config.ts
/**
 * @file wizard.config.ts
 * @description SSoT para la configuración del asistente de la SDC.
 * @version 11.0.0 (Holistic Integrity & FSD Alignment)
 * @author RaZ Podestá - MetaShark Tech
 */
import type { ComponentType } from "react";
import { z } from "zod";
import type { StepProps } from "@/shared/lib/types/campaigns/step.types";
import { logger } from "@/shared/lib/logging";
import { Step0 } from "@/components/features/campaign-suite/Step0_Identity";
import { Step1 } from "@/components/features/campaign-suite/Step1_Structure";
import { Step2 } from "@/components/features/campaign-suite/Step2_Layout";
import { Step3 } from "@/components/features/campaign-suite/Step3_Theme";
import { Step4 } from "@/components/features/campaign-suite/Step4_Content";
import { Step5 } from "@/components/features/campaign-suite/Step5_Management";
import {
  Step0ContentSchema,
  Step1ContentSchema,
  Step2ContentSchema,
  Step3ContentSchema,
  Step4ContentSchema,
  Step5ContentSchema,
} from "@/shared/lib/schemas/campaigns/steps";

logger.trace("[wizard.config] Cargando SDC v11.0 (Holistic & FSD).");

export interface StepDefinition<TContent extends z.ZodRawShape> {
  readonly id: number;
  readonly titleKey: string;
  readonly Component: ComponentType<StepProps<z.infer<z.ZodObject<TContent>>>>;
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
    Component: Step0,
    i18nPath: "messages/pages/dev/campaign-suite/steps/step0.i18n.json",
    schema: z.object({ step0: Step0ContentSchema }),
  }),
  createStep({
    id: 1,
    titleKey: "Estructura",
    Component: Step1,
    i18nPath: "messages/pages/dev/campaign-suite/steps/step1.i18n.json",
    schema: z.object({ step1: Step1ContentSchema }),
  }),
  createStep({
    id: 2,
    titleKey: "Layout",
    Component: Step2,
    i18nPath: "messages/pages/dev/campaign-suite/steps/step2.i18n.json",
    schema: z.object({ step2: Step2ContentSchema }),
  }),
  createStep({
    id: 3,
    titleKey: "Tema",
    Component: Step3,
    i18nPath: "messages/pages/dev/campaign-suite/steps/step3.i18n.json",
    schema: z.object({ step3: Step3ContentSchema }),
  }),
  createStep({
    id: 4,
    titleKey: "Contenido",
    Component: Step4,
    i18nPath: "messages/pages/dev/campaign-suite/steps/step4.i18n.json",
    schema: z.object({ step4: Step4ContentSchema }),
  }),
  createStep({
    id: 5,
    titleKey: "Gestión",
    Component: Step5,
    i18nPath: "messages/pages/dev/campaign-suite/steps/step5.i18n.json",
    schema: z.object({ step5: Step5ContentSchema }),
  }),
] as const;

export type StepConfig = (typeof stepsConfig)[number];
// Ruta correcta: src/shared/lib/config/campaign-suite/wizard.config.ts
