// RUTA: src/shared/lib/ssg/pipelines/campaign.build-pipeline.ts
/**
 * @file campaign.build-pipeline.ts
 * @description SSoT para la definición de la "receta" de un build de campaña.
 *              Este módulo es una función pura que configura un pipeline de build.
 * @version 2.0.0 (Type-Safe Task Contract)
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";

import { BuildPipeline } from "@/shared/lib/ssg/engine/build-pipeline";
import * as generators from "@/shared/lib/ssg/generators";
import { copyComponentDependencies } from "@/shared/lib/ssg/componentCopier";
import { runScopedNextBuild } from "@/shared/lib/ssg/programmatic-builder";
import { packageDirectory } from "@/shared/lib/ssg/packager";
import fs from "fs/promises";
import type { CampaignDraftDataSchema } from "@/shared/lib/schemas/campaigns/draft.schema";
import type { z } from "zod";

type ValidatedDraft = z.infer<typeof CampaignDraftDataSchema>;

/**
 * @function defineCampaignBuildPipeline
 * @description Configura una instancia de BuildPipeline con todas las tareas
 *              necesarias para generar un paquete de campaña estático.
 * @param pipeline - La instancia de BuildPipeline a configurar.
 * @param traceId - El ID de traza para la observabilidad.
 */
export function defineCampaignBuildPipeline(
  pipeline: BuildPipeline,
  traceId: string
): void {
  pipeline
    .addTask({
      name: "Setup Directories",
      // --- [INICIO DE REFACTORIZACIÓN DE ÉLITE] ---
      // Se utiliza un cuerpo de bloque para asegurar un retorno `void`.
      execute: async (ctx) => {
        await fs.mkdir(ctx.tempDir, { recursive: true });
      },
      // --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---
    })
    .addTask({
      name: "Generate package.json",
      execute: (ctx) =>
        generators.generatePackageJson(
          ctx.draft as ValidatedDraft,
          ctx.tempDir
        ),
    })
    .addTask({
      name: "Generate Next.js Config",
      execute: (ctx) => generators.generateNextConfig(ctx.draft, ctx.tempDir),
    })
    .addTask({
      name: "Generate PostCSS Config",
      execute: (ctx) => generators.generatePostcssConfig(ctx.tempDir),
    })
    .addTask({
      name: "Generate Tailwind Config",
      execute: (ctx) => generators.generateTailwindConfig(ctx.tempDir),
    })
    .addTask({
      name: "Generate globals.css",
      execute: (ctx) => generators.generateGlobalsCss(ctx.draft, ctx.tempDir),
    })
    .addTask({
      name: "Generate Layout",
      execute: (ctx) => generators.generateLayout(ctx.draft, ctx.tempDir),
    })
    .addTask({
      name: "Generate Page",
      execute: (ctx) => generators.generatePage(ctx.draft, ctx.tempDir),
    })
    .addTask({
      name: "Generate Content & Theme Files",
      execute: async (ctx) => {
        await generators.generateContentFile(ctx.draft, ctx.tempDir);
        await generators.generateThemeFile(ctx.draft, ctx.tempDir);
      },
    })
    .addTask({
      name: "Copy Component Dependencies",
      execute: (ctx) => copyComponentDependencies(ctx.draft, ctx.tempDir),
    })
    .addTask({
      name: "Run Next.js Build",
      execute: async (ctx) => {
        if (!ctx.draft.baseCampaignId || !ctx.draft.draftId) {
          throw new Error(
            "Faltan IDs críticos (baseCampaignId o draftId) para el build."
          );
        }
        await runScopedNextBuild(
          ctx.draft.baseCampaignId,
          ctx.draft.draftId,
          ctx.tempDir,
          traceId
        );
      },
    })
    .addTask({
      name: "Package Artifacts",
      execute: async (ctx) => {
        await packageDirectory(ctx.buildDir, ctx.zipPath, traceId);
      },
    });
}
