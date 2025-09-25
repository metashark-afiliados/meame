// RUTA: src/components/features/campaign-suite/Step0_Identity/Step0.tsx
/**
 * @file Step0.tsx
 * @description Ensamblador y Cargador de Datos para el Paso 0 de la SDC.
 *              v3.2.0 (Sovereign Path Restoration): Resuelve el error crítico de
 *              build 'Module not found' al alinear la importación de la Server Action
 *              con la SSoT de la arquitectura FSD.
 * @version 3.2.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { logger } from "@/shared/lib/logging";
import { Step0Client } from "./Step0Client";
// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
// Se corrige la ruta de importación para apuntar a la SSoT soberana de las
// Server Actions, utilizando el alias de ruta canónico. Esto resuelve
// el error de build "Module not found". [2]
import { getBaseCampaignsAction } from "@/shared/lib/actions/campaign-suite/getBaseCampaigns.action";
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---
import { DynamicIcon } from "@/components/ui";
import type { StepProps } from "@/shared/lib/types/campaigns/step.types";
import type { Step0ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step0.schema";
import type { z } from "zod";

type Content = z.infer<typeof Step0ContentSchema>;

export default function Step0({
  content: rawContent,
}: StepProps<{ step0: Content }>): React.ReactElement {
  const content = rawContent.step0;
  const [baseCampaigns, setBaseCampaigns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      logger.info("[Step0] Obteniendo campañas base desde el servidor...");
      const result = await getBaseCampaignsAction();
      if (result.success) {
        setBaseCampaigns(result.data);
      } else {
        toast.error("Error de Carga", { description: result.error });
      }
      setIsLoading(false);
    };
    fetchCampaigns();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <DynamicIcon name="LoaderCircle" className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return <Step0Client content={content} baseCampaigns={baseCampaigns} />;
}
// RUTA: src/components/features/campaign-suite/Step0_Identity/Step0.tsx
