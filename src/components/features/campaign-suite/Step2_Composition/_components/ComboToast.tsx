// RUTA: app/[locale]/(dev)/dev/campaign-suite/_components/Step2_Composition/_components/ComboToast.tsx
/**
 * @file ComboToast.tsx
 * @description Componente de UI para la notificación (toast) de Combo Estratégico.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { toast } from "sonner";
import { DynamicIcon } from "@/components/ui";
import type { StrategicCombo } from "@/shared/lib/config/strategic-combos.config";
import { Button } from "@/components/ui/Button";

interface ComboToastProps {
  combo: StrategicCombo;
}

function ComboToast({ combo }: ComboToastProps): React.ReactElement {
  return (
    <div className="flex items-center gap-4 w-full">
      <DynamicIcon
        name={combo.icon as any}
        className="h-10 w-10 text-yellow-400"
      />
      <div className="flex flex-col">
        <h3 className="font-bold text-base text-foreground">{combo.name}</h3>
        <p className="text-sm text-muted-foreground">{combo.description}</p>
      </div>
    </div>
  );
}

/**
 * @function showComboToast
 * @description Función helper para invocar el toast de combo de forma programática.
 * @param {StrategicCombo} combo - El combo que se ha detectado.
 */
export function showComboToast(combo: StrategicCombo) {
  toast.custom(
    (t) => (
      <div className="flex items-center gap-2 bg-background border shadow-lg rounded-lg p-4 w-full max-w-sm">
        <ComboToast combo={combo} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toast.dismiss(t)}
          className="absolute top-1 right-1 h-6 w-6"
        >
          <DynamicIcon name="X" className="h-4 w-4" />
        </Button>
      </div>
    ),
    {
      duration: 5000, // El toast dura 5 segundos
    }
  );
}
