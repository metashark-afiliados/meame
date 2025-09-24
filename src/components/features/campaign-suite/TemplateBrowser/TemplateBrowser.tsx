// RUTA: components/features/campaign-suite/TemplateBrowser/TemplateBrowser.tsx (MOVIDO Y NIVELADO)
/**
 * @file TemplateBrowser.tsx
 * @description Interfaz para seleccionar una plantilla de campaña o empezar de cero.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
// ... más imports (Button, Card, etc.)
import type { CampaignTemplate } from "@/shared/lib/schemas/campaigns/template.schema";

interface TemplateBrowserProps {
  onTemplateSelect: (template: CampaignTemplate) => void;
  onStartFromScratch: () => void;
}

export function TemplateBrowser({
  onTemplateSelect,
  onStartFromScratch,
}: TemplateBrowserProps) {
  // Lógica para obtener y mostrar plantillas aquí...
  return (
    <div>
      <h1>Selecciona una Plantilla</h1>
      {/* Grid de plantillas */}
      <Button onClick={onStartFromScratch}>Empezar desde Cero</Button>
    </div>
  );
}
