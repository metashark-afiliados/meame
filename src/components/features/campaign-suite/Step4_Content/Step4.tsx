// app/[locale]/(dev)/dev/campaign-suite/_components/Step4_Content/Step4.tsx
/**
 * @file Step4.tsx
 * @description Ensamblador de Servidor para el Paso 4 de la SDC (Contenido).
 * @version 2.0.0 (Holistic Type Alignment): Se alinea con la nueva
 *              arquitectura de props "envueltas".
 * @version 2.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { logger } from "@/shared/lib/logging";
import { Step4Client } from "./Step4Client";
import type { StepProps } from "@/shared/lib/types/campaigns/step.types";
import type { Step4ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step4.schema";
import type { z } from "zod";

type Content = z.infer<typeof Step4ContentSchema>;

export default async function Step4({
  content: rawContent,
}: StepProps<{ step4: Content }>): Promise<React.ReactElement> {
  const content = rawContent.step4;
  logger.info("[Step4 Ensamblador] Ensamblando y delegando al cliente...");
  return <Step4Client content={content} />;
}
// app/[locale]/(dev)/dev/campaign-suite/_components/Step4_Content/Step4.tsx
