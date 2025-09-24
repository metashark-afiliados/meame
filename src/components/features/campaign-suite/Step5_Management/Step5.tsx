// RUTA: app/[locale]/(dev)/dev/campaign-suite/_components/Step5_Management/Step5.tsx
/**
 * @file Step5.tsx
 * @description Componente de Servidor que actúa como punto de entrada para el Paso 5.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { type StepComponentProps } from "../../_types/wizard.types";
import { Step5Client } from "./Step5Client";

export async function Step5({
  locale,
  content,
}: StepComponentProps): Promise<React.ReactElement> {
  const stepContent = content.step5; // El contenido ya ha sido validado por el asistente

  return <Step5Client locale={locale} stepContent={stepContent} />;
}
