// RUTA: src/components/features/campaign-suite/Step1_Structure/Step1Form.tsx
/**
 * @file Step1Form.tsx
 * @description Componente de Presentación para la UI del Paso 1, ahora blindado
 *              con un Guardián de Resiliencia de múltiples fases y observabilidad de élite.
 * @version 9.0.0 (Elite Resilience & Full Observability)
 * @author L.I.A. Legacy
 */
"use client";

import React from "react";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/Card";
import { logger } from "@/shared/lib/logging";
import type {
  HeaderConfig,
  FooterConfig,
} from "@/shared/lib/types/campaigns/draft.types";
import { WizardNavigation } from "@/components/features/campaign-suite/_components/WizardNavigation";
import { galleryConfig } from "@/shared/lib/config/campaign-suite/gallery.config";
import { StructuralSectionConfig } from "./_components";
// --- [INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA (CORRECCIÓN TS2307)] ---
// Se corrige la ruta de importación para que apunte a la SSoT canónica del schema.
import { Step1ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step1.schema";
// --- [FIN DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";

type Step1Content = z.infer<typeof Step1ContentSchema>;

interface Step1FormProps {
  content: Step1Content;
  headerConfig: HeaderConfig;
  footerConfig: FooterConfig;
  onHeaderConfigChange: (newConfig: Partial<HeaderConfig>) => void;
  onFooterConfigChange: (newConfig: Partial<FooterConfig>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function Step1Form({
  content,
  headerConfig,
  footerConfig,
  onHeaderConfigChange,
  onFooterConfigChange,
  onBack,
  onNext,
}: Step1FormProps): React.ReactElement {
  const traceId = logger.startTrace("Step1Form_Render_v9.0");
  logger.info("[Step1Form] Renderizando orquestador de presentación v9.0.", {
    traceId,
  });
  logger.trace("[Step1Form] Props recibidas:", {
    content,
    headerConfig,
    footerConfig,
  });

  // --- [INICIO: GUARDIÁN DE RESILIENCIA DE MÚLTIPLES FASES] ---
  if (!content) {
    const errorMsg =
      "Contrato de UI violado: La prop 'content' es nula o indefinida.";
    logger.error(`[Guardián de Resiliencia][Step1Form] ${errorMsg}`, {
      traceId,
    });
    logger.endTrace(traceId);
    return (
      <DeveloperErrorDisplay
        context="Step1Form Guardián de Contenido"
        errorMessage={errorMsg}
      />
    );
  }

  const areCallbacksValid =
    typeof onBack === "function" && typeof onNext === "function";
  if (!areCallbacksValid) {
    const errorMsg =
      "Contrato de UI violado: Las props 'onBack' u 'onNext' no son funciones.";
    logger.error(`[Guardián de Resiliencia][Step1Form] ${errorMsg}`, {
      traceId,
    });
    logger.endTrace(traceId);
    return (
      <DeveloperErrorDisplay
        context="Step1Form Guardián de Callbacks"
        errorMessage={errorMsg}
      />
    );
  }
  // --- [FIN: GUARDIÁN DE RESILIENCIA] ---

  logger.endTrace(traceId);
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{content.title}</CardTitle>
        <CardDescription>{content.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StructuralSectionConfig
            switchId="use-header"
            switchLabel={content.headerSwitchLabel}
            galleryTitle={content.headerGalleryTitle}
            isEnabled={headerConfig.useHeader}
            onToggle={(checked) => onHeaderConfigChange({ useHeader: checked })}
            galleryItems={galleryConfig.headers}
            selectedValue={headerConfig.componentName}
            onSelectionChange={(value) =>
              onHeaderConfigChange({ componentName: value })
            }
            descriptions={content.galleryDescriptions}
          />
          <StructuralSectionConfig
            switchId="use-footer"
            switchLabel={content.footerSwitchLabel}
            galleryTitle={content.footerGalleryTitle}
            isEnabled={footerConfig.useFooter}
            onToggle={(checked) => onFooterConfigChange({ useFooter: checked })}
            galleryItems={galleryConfig.footers}
            selectedValue={footerConfig.componentName}
            onSelectionChange={(value) =>
              onFooterConfigChange({ componentName: value })
            }
            descriptions={content.galleryDescriptions}
          />
        </div>
      </CardContent>
      <CardFooter className="sticky bottom-0 bg-background/95 backdrop-blur-sm py-4 border-t z-10">
        <WizardNavigation
          onBack={() => {
            logger.traceEvent(traceId, "Interacción: Botón 'Atrás' clickeado.");
            onBack();
          }}
          onNext={() => {
            logger.traceEvent(
              traceId,
              "Interacción: Botón 'Siguiente' clickeado."
            );
            onNext();
          }}
        />
      </CardFooter>
    </Card>
  );
}
