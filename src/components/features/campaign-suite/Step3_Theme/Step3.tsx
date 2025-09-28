// RUTA: src/components/features/campaign-suite/Step3_Theme/Step3.tsx
/**
 * @file Step3.tsx
 * @description Ensamblador de Servidor para el Paso 3, que ahora actúa como un
 *              "passthrough" de datos hacia su cliente.
 * @version 8.0.0 (Data Flow Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { logger } from "@/shared/lib/logging";
import { Step3Client } from "./Step3Client";
import type { StepProps } from "@/shared/lib/types/campaigns/step.types";
import type { Step3ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step3.schema";
import type { z } from "zod";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";
import { loadAllThemeFragmentsAction } from "@/shared/lib/actions/campaign-suite";

type Content = z.infer<typeof Step3ContentSchema>;

export default async function Step3({
  content,
}: StepProps<Content>): Promise<React.ReactElement> {
  logger.info("[Step3 Ensamblador] Obteniendo datos para el Paso 3 (v8.0)...");

  // Este componente de servidor ahora es el responsable de cargar los fragmentos.
  const fragmentsResult = await loadAllThemeFragmentsAction();

  if (!fragmentsResult.success) {
    return (
      <DeveloperErrorDisplay
        context="Step3 Server Component"
        errorMessage="No se pudieron cargar los recursos para el compositor de temas."
        errorDetails={fragmentsResult.error}
      />
    );
  }

  // Pasa los datos cargados al componente de cliente.
  return (
    <Step3Client
      content={content}
      loadedFragments={fragmentsResult.data}
      fetchError={null}
    />
  );
}
// RUTA: src/components/features/campaign-suite/Step3_Theme/Step3.tsx
