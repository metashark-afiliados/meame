// app/[locale]/(dev)/dev/campaign-suite/_components/Step3_Theme/Step3Form.tsx
/**
 * @file Step3Form.tsx
 * @description Orquestador de presentación para el Paso 3.
 *              v6.0.0 (Theme Composer Integration): Refactorizado para lanzar el
 *              modal del Compositor de Temas en lugar de mostrar selectores estáticos.
 * @version 6.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { logger } from "@/shared/lib/logging";
import type { ThemeConfig } from "@/shared/lib/types/campaigns/draft.types";
import { WizardNavigation } from "@/components/features/campaign-suite/_components/WizardNavigation";
import type { Step3ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step3.schema";
import type { z } from "zod";
import { DynamicIcon } from "@/components/ui";

type Content = z.infer<typeof Step3ContentSchema>;

interface Step3FormProps {
  content: Content;
  themeConfig: ThemeConfig;
  onBack: () => void;
  onNext: () => void;
  onLaunchComposer: () => void; // Nueva prop para abrir el modal
}

export function Step3Form({
  content,
  themeConfig,
  onBack,
  onNext,
  onLaunchComposer,
}: Step3FormProps): React.ReactElement {
  logger.info("[Step3Form] Renderizando orquestador de presentación v6.0.");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{content.title}</CardTitle>
        <CardDescription>{content.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-10">
        {/* Resumen del Tema Actual */}
        <div className="space-y-4 p-6 border rounded-lg bg-muted/20">
          <h3 className="font-semibold text-lg text-foreground">Tema Activo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <p>
              <strong>{content.colorsLabel}:</strong>{" "}
              {themeConfig.colorPreset || "Por defecto"}
            </p>
            <p>
              <strong>{content.fontsLabel}:</strong>{" "}
              {themeConfig.fontPreset || "Por defecto"}
            </p>
            <p>
              <strong>{content.radiiLabel}:</strong>{" "}
              {themeConfig.radiusPreset || "Por defecto"}
            </p>
          </div>
          <Button variant="outline" onClick={onLaunchComposer}>
            <DynamicIcon name="Palette" className="mr-2 h-4 w-4" />
            {content.composerTitle}
          </Button>
        </div>

        <WizardNavigation
          onBack={onBack}
          onNext={onNext}
          nextButtonText={content.nextButtonText}
        />
      </CardContent>
    </Card>
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_components/Step3_Theme/Step3Form.tsx
