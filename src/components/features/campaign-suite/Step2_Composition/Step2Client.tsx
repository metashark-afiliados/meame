// RUTA: app/[locale]/(dev)/dev/campaign-suite/_components/Step2_Composition/Step2Client.tsx
/**
 * @file Step2Client.tsx
 * @description Orquestador de cliente para el Paso 2. Ahora con MEA/UX.
 * @version 2.0.0 (MEA/UX Strategic Combos)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
// ... (otros imports) ...
import { useCampaignDraft } from "@/shared/hooks/campaign-suite/use-campaign-draft";
import { detectStrategicCombos } from "../../_utils/combo.detector";
import { showComboToast } from "./_components/ComboToast";
import type { SectionName } from "@/shared/lib/config/sections.config";

export function Step2Client(/* ...props... */): React.ReactElement {
  const { draft, updateLayout } = useCampaignDraft();
  // ... (más lógica) ...

  const handleAddSection = (sectionName: SectionName) => {
    const newLayout = [
      ...draft.layoutConfig,
      { id: Date.now().toString(), name: sectionName },
    ];
    updateLayout(newLayout);

    // --- [INICIO DE MEJORA MEA/UX] ---
    const detectedCombo = detectStrategicCombos(newLayout, sectionName);
    if (detectedCombo) {
      // Si se detecta un combo, disparamos la notificación visual.
      showComboToast(detectedCombo);
    }
    // --- [FIN DE MEJORA MEA/UX] ---
  };

  // ... (resto de la lógica) ...

  return (
    <Step2Form
      // ... (otras props) ...
      onAddSection={handleAddSection}
    />
  );
}
