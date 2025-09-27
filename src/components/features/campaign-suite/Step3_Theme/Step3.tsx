// RUTA: src/components/features/campaign-suite/Step3_Theme/Step3.tsx
/**
 * @file Step3.tsx
 * @description Ensamblador de Servidor para el Paso 3, con contrato de props simplificado.
 * @version 6.0.0 (Simplified Prop Contract)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { logger } from "@/shared/lib/logging";
import { Step3Client } from "./Step3Client";
import { getThemeFragmentsAction } from "@/shared/lib/actions/campaign-suite";
import type { StepProps } from "@/shared/lib/types/campaigns/step.types";
import type { Step3ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step3.schema";
import type { z } from "zod";
import { loadJsonAsset } from "@/shared/lib/i18n/campaign.data.loader";
import type { AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";
import type { LoadedFragments } from "@/components/features/dev-tools/SuiteStyleComposer/types";

type Content = z.infer<typeof Step3ContentSchema>;

// --- [INICIO DE REFACTORIZACIÓN DE CONTRATO] ---
export default async function Step3({
  content,
}: StepProps<Content>): Promise<React.ReactElement> {
  // --- [FIN DE REFACTORIZACIÓN DE CONTRATO] ---
  logger.info(
    "[Step3 Ensamblador] Obteniendo datos de producción para el Paso 3 (v6.0)..."
  );

  const fragmentsResult = await getThemeFragmentsAction();
  let allLoadedFragments: LoadedFragments | null = null;
  let fetchError: string | null = null;

  if (fragmentsResult.success) {
    const fragments = fragmentsResult.data;
    try {
      const [base, colors, fonts, radii] = await Promise.all([
        loadJsonAsset<Partial<AssembledTheme>>(
          "theme-fragments",
          "base",
          "global.theme.json"
        ),
        Promise.all(
          fragments.colors.map((name: string) =>
            loadJsonAsset<Partial<AssembledTheme>>(
              "theme-fragments",
              "colors",
              `${name}.colors.json`
            ).then((data) => ({ name, data }))
          )
        ),
        Promise.all(
          fragments.fonts.map((name: string) =>
            loadJsonAsset<Partial<AssembledTheme>>(
              "theme-fragments",
              "fonts",
              `${name}.fonts.json`
            ).then((data) => ({ name, data }))
          )
        ),
        Promise.all(
          fragments.radii.map((name: string) =>
            loadJsonAsset<Partial<AssembledTheme>>(
              "theme-fragments",
              "radii",
              `${name}.radii.json`
            ).then((data) => ({ name, data }))
          )
        ),
      ]);

      allLoadedFragments = {
        base,
        colors: Object.fromEntries(colors.map((c) => [c.name, c.data])),
        fonts: Object.fromEntries(fonts.map((f) => [f.name, f.data])),
        radii: Object.fromEntries(radii.map((r) => [r.name, r.data])),
      };
    } catch (error) {
      fetchError =
        error instanceof Error
          ? error.message
          : "Error al cargar fragmentos de tema.";
    }
  } else {
    fetchError = fragmentsResult.error;
  }

  return (
    <Step3Client
      content={content}
      loadedFragments={allLoadedFragments}
      fetchError={fetchError}
    />
  );
}
// RUTA: src/components/features/campaign-suite/Step3_Theme/Step3.tsx
