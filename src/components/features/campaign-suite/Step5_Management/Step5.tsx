// RUTA: src/components/features/campaign-suite/Step5_Management/Step5.tsx
/**
 * @file Step5.tsx
 * @description Componente de Servidor que actúa como punto de entrada para el Paso 5.
 * @version 2.0.0 (Sovereign Path & Type Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { type StepProps } from "@/shared/lib/types/campaigns/step.types"; // <-- RUTA Y TIPO CORREGIDOS
import { Step5Client } from "./Step5Client";
import { type Step5ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step5.schema";
import { type z } from "zod";

type Content = z.infer<typeof Step5ContentSchema>;

// Se utiliza el tipo `StepProps` correcto.
export function Step5({
  content: rawContent,
}: StepProps<{ step5: Content }>): React.ReactElement {
  const stepContent = rawContent.step5;

  return <Step5Client locale={"it-IT"} stepContent={stepContent} />; // Locale es un placeholder, se obtendrá del contexto real
}
