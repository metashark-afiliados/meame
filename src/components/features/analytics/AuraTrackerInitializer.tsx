// RUTA: src/components/features/analytics/AuraTrackerInitializer.tsx
/**
 * @file AuraTrackerInitializer.tsx
 * @description Componente de cliente "headless" para inicializar el tracker de "Aura".
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useAuraTracker } from "@/shared/hooks/analytics/use-aura-tracker";

interface AuraTrackerInitializerProps {
  campaignId: string;
  variantId: string;
}

export function AuraTrackerInitializer({
  campaignId,
  variantId,
}: AuraTrackerInitializerProps) {
  // Inicializa el hook con los datos de la campaña actual.
  // El hook se encargará del resto de la lógica.
  useAuraTracker({ campaignId, variantId, enabled: true });

  // Este componente no renderiza nada en la UI.
  return null;
}
