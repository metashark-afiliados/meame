// RUTA: src/components/features/campaign-suite/Step2_Layout/Step2.tsx
/**
 * @file Step2.tsx
 * @description Ensamblador de Servidor para el Paso 2 de la SDC (Layout).
 *              v5.0.0 (Simplified Prop Contract): Alineado con el nuevo contrato
 *              de props directo.
 * @version 5.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { logger } from "@/shared/lib/logging";
import { Step2Client } from "./Step2Client";
import type { StepProps } from "@/shared/lib/types/campaigns/step.types";
import type { Step2ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step2.schema";
import type { z } from "zod";

type Content = z.infer<typeof Step2ContentSchema>;

// --- [INICIO DE REFACTORIZACIÓN DE CONTRATO] ---
export default async function Step2({
  content,
}: StepProps<Content>): Promise<React.ReactElement> {
  // --- [FIN DE REFACTORIZACIÓN DE CONTRATO] ---
  logger.info("[Step2 Ensamblador] Ensamblando v5.0 y delegando al cliente.");
  return <Step2Client content={content} />;
}
// RUTA: src/components/features/campaign-suite/Step2_Layout/Step2.tsx
