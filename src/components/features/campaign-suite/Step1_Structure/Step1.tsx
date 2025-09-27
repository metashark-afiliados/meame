// RUTA: src/components/features/campaign-suite/Step1_Structure/Step1.tsx
/**
 * @file Step1.tsx
 * @description Ensamblador de Servidor para el Paso 1 de la SDC (Estructura).
 *              v4.0.0 (Simplified Prop Contract): Alineado con el nuevo contrato
 *              de props directo, mejorando la cohesión arquitectónica.
 * @version 4.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { logger } from "@/shared/lib/logging";
import { Step1Client } from "./Step1Client";
import type { StepProps } from "@/shared/lib/types/campaigns/step.types";
import type { Step1ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step1.schema";
import type { z } from "zod";

type Content = z.infer<typeof Step1ContentSchema>;

// --- [INICIO DE REFACTORIZACIÓN DE CONTRATO] ---
export default function Step1({
  content,
}: StepProps<Content>): React.ReactElement {
  // --- [FIN DE REFACTORIZACIÓN DE CONTRATO] ---
  logger.info("[Step1 Ensamblador] Ensamblando v4.0 y delegando al cliente...");
  return <Step1Client content={content} />;
}
// RUTA: src/components/features/campaign-suite/Step1_Structure/Step1.tsx
