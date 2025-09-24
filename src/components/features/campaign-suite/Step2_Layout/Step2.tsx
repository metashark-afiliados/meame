// app/[locale]/(dev)/dev/campaign-suite/_components/Step2_Layout/Step2.tsx
/**
 * @file Step2.tsx
 * @description Ensamblador de Servidor para el Paso 2 de la SDC (Layout).
 * @version 3.0.0 (Holistic Type Alignment): Se alinea con la nueva
 *              arquitectura de props "envueltas".
 * @version 3.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { logger } from "@/shared/lib/logging";
import { Step2Client } from "./Step2Client";
import type { StepProps } from "@/shared/lib/types/campaigns/step.types";
import type { Step2ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step2.schema";
import type { z } from "zod";

type Content = z.infer<typeof Step2ContentSchema>;

export default async function Step2({
  content: rawContent,
}: StepProps<{ step2: Content }>): Promise<React.ReactElement> {
  const content = rawContent.step2;
  logger.info("[Step2 Ensamblador] Ensamblando y delegando al cliente (v3.0).");
  return <Step2Client content={content} />;
}
// app/[locale]/(dev)/dev/campaign-suite/_components/Step2_Layout/Step2.tsx
