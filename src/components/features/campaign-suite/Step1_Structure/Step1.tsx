// RUTA: src/components/features/campaign-suite/Step1_Structure/Step1.tsx
/**
 * @file Step1.tsx
 * @description Ensamblador de Servidor para el Paso 1 de la SDC (Estructura).
 *              Blindado con guardianes de resiliencia y tipos, y con observabilidad
 *              de ciclo de vida completo. Cumple con la Higiene de Código Absoluta.
 * @version 6.2.0 (Elite Code Hygiene & Linter Compliance)
 *@author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { logger } from "@/shared/lib/logging";
import { Step1Client } from "./Step1Client";
import type { StepProps } from "@/shared/lib/types/campaigns/step.types";
import type { Step1ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step1.schema";
import type { z } from "zod";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";

type Content = z.infer<typeof Step1ContentSchema>;

export default function Step1({
  content,
}: StepProps<Content>): React.ReactElement {
  const traceId = logger.startTrace("Step1_ServerShell_Render_v6.2");
  logger.traceEvent(
    traceId,
    "Ensamblando Server Shell del Paso 1 y delegando al cliente..."
  );

  try {
    if (!content) {
      throw new Error(
        "Contrato de UI violado: La prop 'content' para Step1 es nula o indefinida."
      );
    }

    logger.traceEvent(traceId, "Contenido validado. Renderizando Step1Client.");
    logger.endTrace(traceId);

    return <Step1Client content={content} />;
  } catch (error) {
    // --- [INICIO: REFACTORIZACIÓN DE HIGIENE DE CÓDIGO] ---
    // Se elimina la variable 'errorMessage' no utilizada. El logger y el
    // DeveloperErrorDisplay consumen directamente el objeto 'error'.
    logger.error("[Guardián de Resiliencia][Step1] Fallo crítico.", {
      error,
      traceId,
    });
    logger.endTrace(traceId);

    return (
      <DeveloperErrorDisplay
        context="Step1 Server Shell"
        errorMessage="No se pudo renderizar el componente del Paso 1 debido a un problema con los datos de entrada."
        errorDetails={error instanceof Error ? error : String(error)}
      />
    );
    // --- [FIN: REFACTORIZACIÓN DE HIGIENE DE CÓDIGO] ---
  }
}
