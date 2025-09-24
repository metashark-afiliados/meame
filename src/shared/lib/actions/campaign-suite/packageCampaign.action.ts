// Ruta correcta: src/shared/lib/actions/campaign-suite/packageCampaign.action.ts
/**
 * @file packageCampaign.action.ts
 * @description Server Action de élite que orquesta el "Motor de Forja" SSG.
 * @version 4.0.0 (Holistic Integrity Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import fs from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import { CampaignDraftDataSchema } from "@/shared/lib/schemas/campaigns/draft.schema";
import { BuildPipeline } from "@/shared/lib/ssg/engine/build-pipeline";
import type { BuildContext } from "@/shared/lib/ssg/engine/types";
import * as generators from "@/shared/lib/ssg/generators";
import { copyComponentDependencies } from "@/shared/lib/ssg/componentCopier";
import { runScopedNextBuild } from "@/shared/lib/ssg/programmatic-builder";
import { packageDirectory } from "@/shared/lib/ssg/packager";

export async function packageCampaignAction(
  draft: CampaignDraft
): Promise<ActionResult<{ downloadUrl: string }>> {
  if (!draft.draftId) {
    const errorMsg =
      "El borrador debe ser guardado al menos una vez antes de poder ser empaquetado.";
    logger.warn(`[Action] Intento de empaquetar un borrador sin ID.`, {
      draft,
    });
    return { success: false, error: errorMsg };
  }

  const traceId = logger.startTrace(`packageCampaign:${draft.draftId}`);
  logger.info(
    `[Action] Iniciando proceso de empaquetado v4.0 para draft: ${draft.draftId}`
  );

  const draftValidation = CampaignDraftDataSchema.safeParse(draft);
  if (!draftValidation.success) {
    logger.error(
      "[Action] El borrador a empaquetar contiene datos corruptos.",
      { errors: draftValidation.error.flatten(), traceId }
    );
    return { success: false, error: "El borrador contiene datos corruptos." };
  }

  const validatedDraftForPipeline: CampaignDraft = {
    ...draft,
    ...draftValidation.data,
    draftId: draft.draftId,
  };

  const tempDir = path.join(
    "/tmp",
    `campaign-${validatedDraftForPipeline.draftId}`
  );
  const buildContext: BuildContext = {
    draft: validatedDraftForPipeline,
    tempDir: tempDir,
    buildDir: path.join(tempDir, "out"),
    zipPath: `${tempDir}.zip`,
  };

  try {
    const pipeline = new BuildPipeline(buildContext)
      .addTask({
        name: "Setup Directories",
        execute: async (ctx) => fs.mkdir(ctx.tempDir, { recursive: true }),
      })
      .addTask({
        name: "Generate package.json",
        execute: (ctx) =>
          generators.generatePackageJson(ctx.draft, ctx.tempDir),
      })
      .addTask({
        name: "Generate Page",
        execute: (ctx) => generators.generatePage(ctx.draft, ctx.tempDir),
      })
      .addTask({
        name: "Copy Component Dependencies",
        execute: (ctx) => copyComponentDependencies(ctx.draft, ctx.tempDir),
      })
      .addTask({
        name: "Run Next.js Build",
        execute: (ctx) =>
          runScopedNextBuild(
            ctx.draft.baseCampaignId!,
            ctx.draft.draftId!,
            ctx.tempDir,
            traceId
          ),
      })
      .addTask({
        name: "Package Artifacts",
        execute: (ctx) => packageDirectory(ctx.buildDir, ctx.zipPath, traceId),
      })
      .addTask({
        name: "Upload to Blob Storage",
        execute: async (ctx) => {
          const zipBuffer = await fs.readFile(ctx.zipPath);
          const blob = await put(
            `campaign-packages/${path.basename(ctx.zipPath)}`,
            zipBuffer,
            { access: "public" }
          );
          (ctx as BuildContext & { downloadUrl?: string }).downloadUrl =
            blob.url;
        },
      })
      .addTask({
        name: "Cleanup",
        execute: async (ctx) => {
          await fs.rm(ctx.tempDir, { recursive: true, force: true });
          await fs.unlink(ctx.zipPath).catch(() => {});
        },
      });

    const pipelineResult = await pipeline.run();

    if (!pipelineResult.success) {
      return pipelineResult;
    }

    const downloadUrl = (
      buildContext as BuildContext & { downloadUrl?: string }
    ).downloadUrl;
    if (!downloadUrl) {
      throw new Error("La URL de descarga no fue generada por el pipeline.");
    }

    logger.endTrace(traceId);
    return { success: true, data: { downloadUrl } };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[Action] Fallo crítico durante el empaquetado.", {
      error: errorMessage,
      traceId,
    });
    await fs
      .rm(buildContext.tempDir, { recursive: true, force: true })
      .catch(() => {});
    await fs.unlink(buildContext.zipPath).catch(() => {});
    logger.endTrace(traceId, { error: errorMessage });
    return { success: false, error: `No se pudo generar el paquete.` };
  }
}
// Ruta correcta: src/shared/lib/actions/campaign-suite/packageCampaign.action.ts
