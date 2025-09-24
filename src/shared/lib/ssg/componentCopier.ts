// app/[locale]/(dev)/dev/campaign-suite/_actions/_utils/componentCopier.ts
/**
 * @file componentCopier.ts
 * @description Utilidad de élite para analizar y copiar recursivamente las
 *              dependencias de componentes de React para el paquete exportado.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server-only";

import fs from "fs/promises";
import path from "path";
import { logger } from "@/shared/lib/logging";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";

const PROJECT_ROOT = process.cwd();
const IMPORT_REGEX = /from\s+['"](@\/.*?)['"]/g;

async function resolveImportPath(importPath: string): Promise<string | null> {
  const basePath = importPath.replace("@/", "");
  const potentialPaths = [
    `${basePath}.tsx`,
    `${basePath}.ts`,
    path.join(basePath, "index.tsx"),
    path.join(basePath, "index.ts"),
  ];

  for (const p of potentialPaths) {
    try {
      const fullPath = path.join(PROJECT_ROOT, p);
      await fs.access(fullPath);
      return fullPath;
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
) {
  if (processedFiles.has(sourcePath)) {
    return;
  }
  processedFiles.add(sourcePath);
  logger.trace(
    `[Copier] Procesando archivo: ${path.relative(PROJECT_ROOT, sourcePath)}`
  );

  const fileContent = await fs.readFile(sourcePath, "utf-8");

  const dependencies = [...fileContent.matchAll(IMPORT_REGEX)];
  for (const match of dependencies) {
    const dependencyImportPath = match[1];
    const resolvedDependencyPath =
      await resolveImportPath(dependencyImportPath);
    if (resolvedDependencyPath) {
      await resolveAndCopy(resolvedDependencyPath, targetRoot, processedFiles);
    }
  }

  const relativePath = path.relative(PROJECT_ROOT, sourcePath);
  const destinationPath = path.join(targetRoot, relativePath);

  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.copyFile(sourcePath, destinationPath);
}

/**
 * @function copyComponentDependencies
 * @description Orquesta el proceso de copia de componentes y sus dependencias.
 * @param {CampaignDraft} draft - El borrador de la campaña.
 * @param {string} targetDir - El directorio raíz del proyecto exportado.
 * @returns {Promise<void>}
 */
export async function copyComponentDependencies(
  draft: CampaignDraft,
  targetDir: string
): Promise<void> {
  logger.trace("[Copier] Iniciando copia de dependencias de componentes...");
  const processed = new Set<string>();

  const requiredSections = [...new Set(draft.layoutConfig.map((s) => s.name))];

  for (const sectionName of requiredSections) {
    const sourcePath = path.join(
      PROJECT_ROOT,
      "components",
      "sections",
      `${sectionName}.tsx`
    );
    await resolveAndCopy(sourcePath, targetDir, processed);
  }

  // Copiamos también los componentes de layout base
  await resolveAndCopy(
    path.join(PROJECT_ROOT, "components", "layout", "SectionAnimator.tsx"),
    targetDir,
    processed
  );

  logger.success(
    `[Copier] Copia de dependencias completada. Total de archivos procesados: ${processed.size}`
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_actions/_utils/componentCopier.ts
