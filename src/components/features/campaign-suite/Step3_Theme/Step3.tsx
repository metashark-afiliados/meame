// RUTA: src/components/features/campaign-suite/Step3_Theme/Step3.tsx
/**
 * @file Step3.tsx
 * @description Ensamblador de Servidor para el Paso 3. Actúa como un cargador
 *              de datos de producción, obteniendo todos los fragmentos de tema
 *              necesarios y pasándolos al cliente.
 * @version 4.0.0 (Production Data Fetching)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { logger } from "@/shared/lib/logging";
import { Step3Client } from "./Step3Client";
import { getThemeFragmentsAction } from "@/shared/lib/actions/campaign-suite/getThemeFragments.action";
import type { StepProps } from "@/shared/lib/types/campaigns/step.types";
import type { Step3ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step3.schema";
import type { z } from "zod";

type Content = z.infer<typeof Step3ContentSchema>;

export default async function Step3({
  content: rawContent,
}: StepProps<{ step3: Content }>): Promise<React.ReactElement> {
  const content = rawContent.step3;
  logger.info(
    "[Step3 Ensamblador] Obteniendo datos de producción para el Paso 3..."
  );

  // Lógica de producción: Se obtienen los nombres de los fragmentos en el servidor.
  const fragmentsResult = await getThemeFragmentsAction();

  return <Step3Client content={content} fragmentsResult={fragmentsResult} />;
}
