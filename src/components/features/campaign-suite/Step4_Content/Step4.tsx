// RUTA: src/components/features/campaign-suite/Step4_Content/Step4.tsx
/**
 * @file Step4.tsx
 * @description Ensamblador de Servidor para el Paso 4, con contrato de props simplificado.
 * @version 4.0.0 (Simplified Prop Contract)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { logger } from "@/shared/lib/logging";
import { Step4Client } from "./Step4Client";
import type { StepProps } from "@/shared/lib/types/campaigns/step.types";
import type { Step4ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step4.schema";
import type { z } from "zod";

type Content = z.infer<typeof Step4ContentSchema>;

// --- [INICIO DE REFACTORIZACIÓN DE CONTRATO] ---
export default async function Step4({
  content,
}: StepProps<Content>): Promise<React.ReactElement> {
  // --- [FIN DE REFACTORIZACIÓN DE CONTRATO] ---
  logger.info("[Step4 Ensamblador] Ensamblando v4.0 y delegando al cliente...");
  return <Step4Client content={content} />;
}
// RUTA: src/components/features/campaign-suite/Step4_Content/Step4.tsx
