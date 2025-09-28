// RUTA: src/components/features/campaign-suite/Step1_Structure/Step1.tsx
/**
 * @file Step1.tsx
 * @description Ensamblador de Servidor para el Paso 1 de la SDC (Estructura).
 *              Actúa como un "Server Shell" que pasa los datos obtenidos del
 *              servidor (contenido i18n) a su componente hijo de cliente.
 * @version 5.0.0 (Holistic & Elite Compliance)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { logger } from "@/shared/lib/logging";
import { Step1Client } from "./Step1Client";
import type { StepProps } from "@/shared/lib/types/campaigns/step.types";
import type { Step1ContentSchema } from "@/shared/lib/schemas/campaign-suite/steps/step1.schema";
import type { z } from "zod";

// SSoT de Tipos para Props
type Content = z.infer<typeof Step1ContentSchema>;

export default function Step1({
  content,
}: StepProps<Content>): React.ReactElement {
  // Pilar III (Observabilidad)
  logger.info(
    "[Step1 Server Shell] Ensamblando v5.0 y delegando al cliente..."
  );

  // Este componente de servidor solo pasa los datos al componente de cliente.
  // Cumple con la Frontera Inmutable.
  return <Step1Client content={content} />;
}
