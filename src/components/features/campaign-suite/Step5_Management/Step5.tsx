// RUTA: src/components/features/campaign-suite/Step5_Management/Step5.tsx
/**
 * @file Step5.tsx
 * @description Componente de Servidor ("Server Shell") que actúa como punto de
 *              entrada para el Paso 5, delegando al cliente.
 * @version 5.0.0 (Elite & Holistic Compliance)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { type StepProps } from "@/shared/lib/types/campaigns/step.types";
import { Step5Client } from "./Step5Client";
import { type Step5ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step5.schema";
import { type z } from "zod";
import { logger } from "@/shared/lib/logging";

type Content = z.infer<typeof Step5ContentSchema>;

export function Step5({ content }: StepProps<Content>): React.ReactElement {
  logger.info("[Step5 Shell] Ensamblando v5.0 y delegando al cliente...");
  return <Step5Client locale={"it-IT"} stepContent={content} />;
}
