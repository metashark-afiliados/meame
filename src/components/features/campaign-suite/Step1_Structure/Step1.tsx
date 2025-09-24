// app/[locale]/(dev)/dev/campaign-suite/_components/Step1_Structure/Step1.tsx
/**
 * @file Step1.tsx
 * @description Ensamblador de Servidor para el Paso 1 de la SDC (Estructura).
 *              v2.0.0 (Holistic Type Alignment): Se alinea con la nueva
 *              arquitectura de props "envueltas".
 * @version 2.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { logger } from "@/shared/lib/logging";
import { Step1Client } from "./Step1Client";
import type { StepProps } from "@/shared/lib/types/campaigns/step.types";
import type { Step1ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step1.schema";
import type { z } from "zod";

type Content = z.infer<typeof Step1ContentSchema>;

export default async function Step1({
  content: rawContent,
}: StepProps<{ step1: Content }>): Promise<React.ReactElement> {
  const content = rawContent.step1;
  logger.info("[Step1 Ensamblador] Ensamblando y delegando al cliente...");
  return <Step1Client content={content} />;
}
// app/[locale]/(dev)/dev/campaign-suite/_components/Step1_Structure/Step1.tsx
