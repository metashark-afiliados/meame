// RUTA: src/components/features/campaign-suite/Step4_Content/Step4Client.tsx
/**
 * @file Step4Client.tsx
 * @description Componente Contenedor de Cliente para el Paso 4 (Contenido).
 *              Ahora consume los stores de layout y contenido atómicos.
 * @version 4.0.0 (Atomic State Consumption)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState } from "react";
import { logger } from "@/shared/lib/logging";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import { useStep2LayoutStore } from "@/shared/hooks/campaign-suite/use-step2-layout.store";
import { useStep4ContentStore } from "@/shared/hooks/campaign-suite/use-step4-content.store";
import { useDraftMetadataStore } from "@/shared/hooks/campaign-suite/use-draft-metadata.store";
import { Step4Form } from "./Step4Form";
import type { z } from "zod";
import type { Step4ContentSchema } from "@/shared/lib/schemas/campaign-suite/steps/step4.schema";

type Step4Content = z.infer<typeof Step4ContentSchema>;

interface Step4ClientProps {
  content?: Step4Content;
}

export function Step4Client({ content }: Step4ClientProps): React.ReactElement {
  logger.info("Renderizando Step4Client (v4.0 - Atomic State).");

  // --- [INICIO DE REFACTORIZACIÓN: CONSUMO DE STORES ATÓMICOS] ---
  const { layoutConfig } = useStep2LayoutStore();
  const { contentData, setSectionContent } = useStep4ContentStore();
  const { completeStep } = useDraftMetadataStore();
  const { goToNextStep, goToPrevStep } = useWizard();

  const [editingSection, setEditingSection] = useState<string | null>(null);
  // --- [FIN DE REFACTORIZACIÓN] ---

  if (!content) {
    logger.error("[Step4Client] El contenido para el Paso 4 es indefinido.");
    return (
      <div className="text-destructive p-8">
        Error: Faltan datos de contenido para este paso.
      </div>
    );
  }

  const handleEditSection = (sectionName: string) =>
    setEditingSection(sectionName);
  const handleCloseEditor = () => setEditingSection(null);

  // La acción de actualización ahora es una llamada directa al store de contenido.
  const handleUpdateContent = (
    sectionName: string,
    locale: Locale,
    field: string,
    value: unknown
  ) => {
    setSectionContent(sectionName, locale, field, value);
  };

  const handleNext = () => {
    logger.info("[Step4Client] El usuario avanza al Paso 5.");
    completeStep(4); // Marca el Paso 4 como completado.
    goToNextStep();
  };

  return (
    <Step4Form
      content={content}
      layoutConfig={layoutConfig}
      contentData={contentData}
      onEditSection={handleEditSection}
      onCloseEditor={handleCloseEditor}
      editingSection={editingSection}
      onUpdateContent={handleUpdateContent}
      onBack={goToPrevStep}
      onNext={handleNext}
      isPending={false} // El estado de 'pending' se gestionará en el editor.
    />
  );
}
