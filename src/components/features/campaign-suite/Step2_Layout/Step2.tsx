// RUTA: src/components/features/campaign-suite/Step2_Layout/Step2.tsx
/**
 * @file Step2.tsx
 * @description Ensamblador de Servidor ("Server Shell") para el Paso 2 de la SDC.
 *              Forjado con un Guardián de Resiliencia y observabilidad de ciclo de
 *              vida completo para una robustez y depuración de nivel de producción.
 * @version 6.0.0 (Elite Resilience & Full Observability)
 * @author L.I.A. Legacy
 */
import React from "react";
import { logger } from "@/shared/lib/logging";
import { Step2Client } from "./Step2Client";
import type { StepProps } from "@/shared/lib/types/campaigns/step.types";
// --- [INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA (CORRECCIÓN TS2307)] ---
// Se corrige la ruta de importación para que apunte a la SSoT canónica del schema.
import type { Step2ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step2.schema";
// --- [FIN DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
import type { z } from "zod";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";

type Content = z.infer<typeof Step2ContentSchema>;

export default function Step2({
  content,
}: StepProps<Content>): React.ReactElement {
  // --- [INICIO: PILAR III - OBSERVABILIDAD DE CICLO DE VIDA COMPLETO] ---
  const traceId = logger.startTrace("Step2_ServerShell_Render_v6.0");
  logger.startGroup(
    "[Step2 Shell] Ensamblando y delegando al cliente...",
    `traceId: ${traceId}`
  );

  // --- [INICIO: GUARDIÁN DE RESILIENCIA HOLÍSTICO] ---
  try {
    if (!content) {
      // Si el contrato de contenido no se cumple, se lanza un error explícito.
      throw new Error(
        "Contrato de UI violado: La prop 'content' para Step2 es nula o indefinida."
      );
    }
    logger.traceEvent(traceId, "Contrato de contenido validado con éxito.");

    // Si todas las validaciones pasan, se renderiza el componente de cliente.
    return <Step2Client content={content} />;
  } catch (error) {
    // El guardián captura cualquier error durante la lógica del Server Shell.
    logger.error("[Guardián de Resiliencia][Step2] Fallo crítico.", {
      error,
      traceId,
    });

    return (
      <DeveloperErrorDisplay
        context="Step2 Server Shell"
        errorMessage="No se pudo renderizar el componente del Paso 2 debido a un problema con los datos de entrada."
        errorDetails={error instanceof Error ? error : String(error)}
      />
    );
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
  // --- [FIN: GUARDIÁN DE RESILIENCIA HOLÍSTICO] ---
}
