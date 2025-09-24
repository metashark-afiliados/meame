// app/[locale]/(dev)/dev/campaign-suite/_components/Step3_Theme/Step3Client.tsx
/**
 * @file Step3Client.tsx
 * @description Contenedor de Cliente para el Paso 3, ahora orquestando el
 *              lanzamiento del Compositor de Temas.
 * @version 5.0.0 (Theme Composer Integration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCampaignDraft } from "@/shared/hooks/campaign-suite/use-campaign-draft";
import type { ThemeConfig } from "@/shared/lib/types/campaigns/draft.types";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import type { DiscoveredFragments } from "@/shared/lib/actions/campaign-suite/getThemeFragments.action";
import { Step3Form } from "./Step3Form";
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import { ThemeComposerModal } from "./_components/ThemeComposerModal";
import type { AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";
import { DynamicIcon } from "@/components/ui";
import type { z } from "zod";
import type { Step3ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step3.schema";

type Step3Content = z.infer<typeof Step3ContentSchema>;

interface Step3ClientProps {
  content?: Step3Content;
  fragmentsResult: ActionResult<DiscoveredFragments>;
}

type LoadedFragments = {
  base: Partial<AssembledTheme>;
  colors: Record<string, Partial<AssembledTheme>>;
  fonts: Record<string, Partial<AssembledTheme>>;
  radii: Record<string, Partial<AssembledTheme>>;
};

export function Step3Client({
  content,
  fragmentsResult,
}: Step3ClientProps): React.ReactElement {
  logger.info("[Step3Client] Renderizando v5.0 (Theme Composer Integration).");

  const { draft, updateDraft } = useCampaignDraft();
  const { goToNextStep, goToPrevStep } = useWizard();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [loadedFragments, setLoadedFragments] =
    useState<LoadedFragments | null>(null);
  const [isLoadingFragments, setIsLoadingFragments] = useState(true);

  useEffect(() => {
    const loadAllFragments = async () => {
      if (!fragmentsResult.success) {
        toast.error("Error Crítico", {
          description: "No se pudieron descubrir los fragmentos de tema.",
        });
        setIsLoadingFragments(false);
        return;
      }

      try {
        const fetchFragment = async (
          path: string
        ): Promise<Partial<AssembledTheme>> => {
          const response = await fetch(path);
          if (!response.ok) return {};
          return await response.json();
        };

        const [base, colors, fonts, radii] = await Promise.all([
          fetchFragment("/theme-fragments/base/global.theme.json"),
          Promise.all(
            fragmentsResult.data.colors.map((name) =>
              fetchFragment(`/theme-fragments/colors/${name}.colors.json`).then(
                (data) => ({ name, data })
              )
            )
          ),
          Promise.all(
            fragmentsResult.data.fonts.map((name) =>
              fetchFragment(`/theme-fragments/fonts/${name}.fonts.json`).then(
                (data) => ({ name, data })
              )
            )
          ),
          Promise.all(
            fragmentsResult.data.radii.map((name) =>
              fetchFragment(`/theme-fragments/radii/${name}.radii.json`).then(
                (data) => ({ name, data })
              )
            )
          ),
        ]);

        setLoadedFragments({
          base,
          colors: Object.fromEntries(colors.map((c) => [c.name, c.data])),
          fonts: Object.fromEntries(fonts.map((f) => [f.name, f.data])),
          radii: Object.fromEntries(radii.map((r) => [r.name, r.data])),
        });
      } catch (error) {
        logger.error("Fallo al cargar los fragmentos de tema.", { error });
        toast.error("Error al cargar datos de tema.");
      } finally {
        setIsLoadingFragments(false);
      }
    };
    loadAllFragments();
  }, [fragmentsResult]);

  const onThemeConfigChange = (newConfig: Partial<ThemeConfig>) => {
    updateDraft({ themeConfig: { ...draft.themeConfig, ...newConfig } });
  };

  if (!content) {
    logger.error("[Step3Client] El contenido para el Paso 3 es indefinido.");
    return (
      <div className="text-destructive p-8">
        Error: Faltan datos de contenido para este paso.
      </div>
    );
  }

  if (isLoadingFragments) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <DynamicIcon
          name="LoaderCircle"
          className="w-8 h-8 animate-spin text-primary"
        />
        <p className="ml-4">Cargando recursos del compositor...</p>
      </div>
    );
  }

  return (
    <>
      <Step3Form
        content={content}
        themeConfig={draft.themeConfig}
        onBack={goToPrevStep}
        onNext={goToNextStep}
        onLaunchComposer={() => setIsComposerOpen(true)}
      />

      {isComposerOpen && loadedFragments && (
        <ThemeComposerModal
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          fragments={loadedFragments}
          currentConfig={draft.themeConfig}
          onSave={onThemeConfigChange}
          content={content}
        />
      )}
    </>
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_components/Step3_Theme/Step3Client.tsx
