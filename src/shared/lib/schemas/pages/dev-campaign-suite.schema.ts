// RUTA: lib/schemas/pages/dev-campaign-suite.schema.ts
/**
 * @file dev-campaign-suite.schema.ts
 * @description Esquema de Zod y SSoT para el contenido i18n de la SDC.
 *              v7.1.0 (Holistic Restoration): Restaura la clave 'preview' que
 *              faltaba en el contrato, resolviendo el error de tipo TS2339
 *              y restaurando la funcionalidad de i18n del LivePreviewCanvas.
 * @version 7.1.0
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
} from "../campaigns/steps";

// --- [INICIO DE RESTAURACIÓN DE CONTRATO] ---
// Se crea un schema atómico para el contenido de la vista previa.
const PreviewContentSchema = z.object({
  loadingTheme: z.string(),
  errorLoadingTheme: z.string(),
});
// --- [FIN DE RESTAURACIÓN DE CONTRATO] ---

export const CampaignSuiteLocaleSchema = z.object({
  campaignSuitePage: z
    .object({
      title: z.string(),
      subtitle: z.string(),
      // --- [INICIO DE RESTAURACIÓN DE CONTRATO] ---
      preview: PreviewContentSchema.optional(), // <-- Se restaura la clave
      // --- [FIN DE RESTAURACIÓN DE CONTRATO] ---
      step0: Step0ContentSchema.optional(),
      step1: Step1ContentSchema.optional(),
      step2: Step2ContentSchema.optional(),
      step3: Step3ContentSchema.optional(),
      step4: Step4ContentSchema.optional(),
      step5: Step5ContentSchema.optional(),
    })
    .optional(),
});
