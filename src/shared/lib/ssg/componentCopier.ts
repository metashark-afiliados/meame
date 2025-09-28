// RUTA: src/shared/lib/ssg/componentCopier.ts
/**
 * @file componentCopier.ts
 * @description Utilidad de élite para analizar y copiar recursivamente las
 *              dependencias de componentes de React para el paquete exportado.
 * @version 2.0.0 (Elite & Resilient)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server-only";

import { promises as fs } from "fs";
import path from "path";
import { logger } from "@/shared/lib/logging";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import { sectionsConfig } from "@/shared/lib/config/sections.config";

const PROJECT_ROOT = process.cwd();
const SRC_ROOT = path.join(PROJECT_ROOT, "src");
const IMPORT_REGEX = /from\s+['"](@\/.*?)['"]/g;

async function resolveImportPath(importPath: string): Promise<string | null> {
  const basePath = path.join(SRC_ROOT, importPath.replace("@/", ""));
  const potentialPaths = [
    `${basePath}.ts`,
    `${basePath}.tsx`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
  ];

  for (const p of potentialPaths) {
    try {
      await fs.access(p);
      return p;
    } catch {
      // Intenta la siguiente ruta
    }
  }
  return null;
}

async function resolveAndCopy(
  sourcePath: string,
  targetRoot: string,
  processedFiles: Set<string>
): Promise<void> {
  const normalizedSourcePath = path.normalize(sourcePath);
  if (processedFiles.has(normalizedSourcePath)) {
    return;
  }
  processedFiles.add(normalizedSourcePath);
  logger.trace(
    `[Copier] Procesando: ${path.relative(PROJECT_ROOT, normalizedSourcePath)}`
  );

  try {
    const fileContent = await fs.readFile(normalizedSourcePath, "utf-8");
    const relativePath = path.relative(PROJECT_ROOT, normalizedSourcePath);
    const destinationPath = path.join(targetRoot, relativePath);

    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.copyFile(normalizedSourcePath, destinationPath);

    const dependencies = [...fileContent.matchAll(IMPORT_REGEX)];
    for (const match of dependencies) {
      const dependencyImportPath = match[1];
      const resolvedDependencyPath =
        await resolveImportPath(dependencyImportPath);
      if (resolvedDependencyPath) {
        await resolveAndCopy(
          resolvedDependencyPath,
          targetRoot,
          processedFiles
        );
      } else {
        logger.warn(
          `[Copier] No se pudo resolver la dependencia: ${dependencyImportPath}`
        );
      }
    }
  } catch (error) {
    logger.error(`[Copier] Fallo al procesar ${normalizedSourcePath}`, {
      error,
    });
  }
}

export async function copyComponentDependencies(
  draft: CampaignDraft,
  targetDir: string
): Promise<void> {
  logger.trace("[Copier] Iniciando copia de dependencias de componentes...");
  const processed = new Set<string>();
  const requiredSections = [...new Set(draft.layoutConfig.map((s) => s.name))];

  // Punto de entrada: El SectionRenderer
  await resolveAndCopy(
    path.join(SRC_ROOT, "components", "layout", "SectionRenderer.tsx"),
    targetDir,
    processed
  );

  // Copiamos las secciones requeridas
  for (const sectionName of requiredSections) {
    if (sectionsConfig[sectionName as keyof typeof sectionsConfig]) {
      const sourcePath = path.join(
        SRC_ROOT,
        "components",
        "sections",
        `${sectionName}.tsx`
      );
      await resolveAndCopy(sourcePath, targetDir, processed);
    }
  }
  logger.success(
    `[Copier] Copia de dependencias completada. Total: ${processed.size} archivos.`
  );
}
