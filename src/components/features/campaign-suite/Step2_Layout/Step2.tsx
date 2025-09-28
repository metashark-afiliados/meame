// RUTA: src/components/features/campaign-suite/Step2_Layout/Step2.tsx
/**
 * @file Step2.tsx
 * @description Ensamblador de Servidor para el Paso 2 de la SDC (Layout).
 *              Actúa como un "Server Shell" que pasa los datos obtenidos del
 *              servidor (contenido i18n) a su componente hijo de cliente.
 * @version 5.0.0 (Simplified Prop Contract)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { logger } from "@/shared/lib/logging";
import { Step2Client } from "./Step2Client";
import type { StepProps } from "@/shared/lib/types/campaigns/step.types";
import type { Step2ContentSchema } from "@/shared/lib/schemas/campaign-suite/steps/step2.schema";
import type { z } from "zod";

// SSoT de Tipos para Props
type Content = z.infer<typeof Step2ContentSchema>;

export default async function Step2({
  content,
}: StepProps<Content>): Promise<React.ReactElement> {
  // Pilar III (Observabilidad)
  logger.info(
    "[Step2 Server Shell] Ensamblando v5.0 y delegando al cliente..."
  );

  // Este componente de servidor solo pasa los datos al componente de cliente.
  // Cumple con la Frontera Inmutable.
  return <Step2Client content={content} />;
}
