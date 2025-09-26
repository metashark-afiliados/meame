// RUTA: src/shared/lib/schemas/pages/dev-campaign-suite.schema.ts
/**
 * @file dev-campaign-suite.schema.ts
 * @description SSoT para el contenido i18n de la SDC.
 * @version 9.0.0 (Sovereign Schema Export)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import {
  Step0ContentSchema,
  Step1ContentSchema,
  Step2ContentSchema,
  Step3ContentSchema,
  Step4ContentSchema,
  Step5ContentSchema,
} from "@/shared/lib/schemas/campaigns/steps";

const PreviewContentSchema = z.object({
  loadingTheme: z.string(),
  errorLoadingTheme: z.string(),
});

// --- [INICIO DE REFACTORIZACIÓN SOBERANA] ---
// Se exporta el schema para que pueda ser importado y consumido directamente.
export const StepperTitlesSchema = z.object({
  identificationTitle: z.string(),
  structureTitle: z.string(),
  layoutTitle: z.string(),
  themeTitle: z.string(),
  contentTitle: z.string(),
  managementTitle: z.string(),
});
// --- [FIN DE REFACTORIZACIÓN SOBERANA] ---

export const CampaignSuiteContentSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  preview: PreviewContentSchema.optional(),
  stepper: StepperTitlesSchema.optional(),
  step0: Step0ContentSchema.optional(),
  step1: Step1ContentSchema.optional(),
  step2: Step2ContentSchema.optional(),
  step3: Step3ContentSchema.optional(),
  step4: Step4ContentSchema.optional(),
  step5: Step5ContentSchema.optional(),
});

export const CampaignSuiteLocaleSchema = z.object({
  campaignSuitePage: CampaignSuiteContentSchema.optional(),
});
