// RUTA: src/components/features/campaign-suite/Step2_Layout/Step2Client.tsx
/**
 * @file Step2Client.tsx
 * @description Componente Contenedor de Cliente para el Paso 2 (Layout).
 *              Orquesta la lógica de estado y la delega al componente de presentación.
 * @version 5.0.0 (ACS Path & State Logic Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { logger } from "@/shared/lib/logging";
import type { LayoutConfigItem } from "@/shared/lib/types/campaigns/draft.types";
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import { Step2Form } from "./Step2Form";
import { useStep2LayoutStore } from "@/shared/hooks/campaign-suite/use-step2-layout.store";
import { useDraftMetadataStore } from "@/shared/hooks/campaign-suite/use-draft-metadata.store";
import { type Step2ContentSchema } from "@/shared/lib/schemas/campaign-suite/steps/step2.schema";
import type { z } from "zod";

// SSoT de Tipos para Props
type Step2Content = z.infer<typeof Step2ContentSchema>;

interface Step2ClientProps {
  content: Step2Content;
}

export function Step2Client({ content }: Step2ClientProps): React.ReactElement {
  // Pilar III (Observabilidad)
  logger.info("Renderizando Step2Client v5.0 (ACS Aligned).");

  // Hooks para la gestión de estado y navegación
  const { layoutConfig, setLayoutConfig } = useStep2LayoutStore();
  const { completeStep } = useDraftMetadataStore();
  const { goToNextStep, goToPrevStep } = useWizard();

  /**
   * @function handleLayoutChange
   * @description Callback que se pasa al LayoutBuilder. Cuando el layout cambia,
   *              actualiza el store atómico de Zustand correspondiente.
   * @param newLayout - El nuevo array de configuración del layout.
   */
  const handleLayoutChange = (newLayout: LayoutConfigItem[]) => {
    logger.trace(
      "[Step2Client] Layout modificado, actualizando store de layout..."
    );
    setLayoutConfig(newLayout);
  };

  /**
   * @function handleNext
   * @description Manejador para el botón "Siguiente". Marca el paso actual como
   *              completado en el store de metadatos y navega al siguiente paso.
   */
  const handleNext = () => {
    logger.info("[Step2Client] El usuario avanza al Paso 3.");
    completeStep(2);
    goToNextStep();
  };

  // El componente de cliente delega toda la renderización de la UI al
  // componente de presentación puro, pasándole los datos y callbacks necesarios.
  return (
    <Step2Form
      content={content}
      layoutConfig={layoutConfig}
      onLayoutChange={handleLayoutChange}
      onBack={goToPrevStep}
      onNext={handleNext}
    />
  );
}
