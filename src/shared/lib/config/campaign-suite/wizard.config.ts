// RUTA: src/shared/lib/config/campaign-suite/wizard.config.ts
/**
 * @file wizard.config.ts
 * @description SSoT de élite para la configuración del asistente SDC.
 * @version 16.0.0 (Direct Type Inference)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import type { ComponentType } from "react";
import type { StepProps } from "@/shared/lib/types/campaigns/step.types";
import {
  Step0,
  Step1,
  Step2,
  Step3,
  Step4,
  Step5,
} from "@/components/features/campaign-suite/steps";
import {
  stepSchemas,
  type StepSchemas,
} from "@/shared/lib/schemas/campaigns/steps";
// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: INFERENCIA DIRECTA] ---
import { StepperTitlesSchema } from "@/shared/lib/schemas/pages/dev-campaign-suite.schema";
// --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

export interface StepConfig {
  readonly id: number;
  // La inferencia ahora es directa, robusta y a prueba de fallos.
  readonly titleKey: keyof z.infer<typeof StepperTitlesSchema>;
  readonly i18nKey: keyof StepSchemas;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly schema: z.ZodObject<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly component: ComponentType<StepProps<any>>;
}

export const stepsConfig: readonly StepConfig[] = [
  {
    id: 0,
    titleKey: "identificationTitle", // Válido
    i18nKey: "step0",
    schema: stepSchemas.step0,
    component: Step0,
  },
  {
    id: 1,
    titleKey: "structureTitle", // Válido
    i18nKey: "step1",
    schema: stepSchemas.step1,
    component: Step1,
  },
  {
    id: 2,
    titleKey: "layoutTitle", // Válido
    i18nKey: "step2",
    schema: stepSchemas.step2,
    component: Step2,
  },
  {
    id: 3,
    titleKey: "themeTitle", // Válido
    i18nKey: "step3",
    schema: stepSchemas.step3,
    component: Step3,
  },
  {
    id: 4,
    titleKey: "contentTitle", // Válido
    i18nKey: "step4",
    schema: stepSchemas.step4,
    component: Step4,
  },
  {
    id: 5,
    titleKey: "managementTitle", // Válido
    i18nKey: "step5",
    schema: stepSchemas.step5,
    component: Step5,
  },
];
