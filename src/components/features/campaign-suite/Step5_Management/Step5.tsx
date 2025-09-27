// RUTA: src/components/features/campaign-suite/Step5_Management/Step5.tsx
/**
 * @file Step5.tsx
 * @description Componente de Servidor que actúa como punto de entrada para el Paso 5.
 * @version 4.0.0 (Simplified Prop Contract)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { type StepProps } from "@/shared/lib/types/campaigns/step.types";
import { Step5Client } from "./Step5Client";
import { type Step5ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step5.schema";
import { type z } from "zod";

type Content = z.infer<typeof Step5ContentSchema>;

// --- [INICIO DE REFACTORIZACIÓN DE CONTRATO] ---
export function Step5({ content }: StepProps<Content>): React.ReactElement {
  // --- [FIN DE REFACTORIZACIÓN DE CONTRATO] ---
  return <Step5Client locale={"it-IT"} stepContent={content} />;
}
// RUTA: src/components/features/campaign-suite/Step5_Management/Step5.tsx
