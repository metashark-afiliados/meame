// app/[locale]/(dev)/dev/campaign-suite/_actions/_generators/generatePackageJson.ts
/**
 * @file generatePackageJson.ts
 * @description Módulo generador soberano para el archivo package.json.
 * @version 2.0.0 (Type Contract Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server-only";

import fs from "fs/promises";
import path from "path";
import { logger } from "@/shared/lib/logging";
import type { z } from "zod";
import type { CampaignDraftDataSchema } from "@/shared/lib/schemas/campaigns/draft.schema";

type ValidatedDraft = z.infer<typeof CampaignDraftDataSchema>;

const sanitizeForPackageName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

export async function generatePackageJson(
  draft: ValidatedDraft, // <-- TIPO CORREGIDO
  targetDir: string
): Promise<void> {
  // ... (lógica interna sin cambios)
  logger.trace("[Generator] Iniciando generación de package.json...", {
    variantName: draft.variantName,
  });

  const packageName = sanitizeForPackageName(draft.variantName || "campaign");

  const packageJsonTemplate = {
    name: packageName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
    dependencies: {
      next: "14.2.3",
      react: "^18",
      "react-dom": "^18",
      clsx: "^2.1.1",
      "framer-motion": "^11.2.10",
      "lucide-react": "^0.394.0",
      "tailwind-merge": "^2.3.0",
      "tailwindcss-animate": "^1.0.7",
    },
    devDependencies: {
      "@types/node": "^20",
      "@types/react": "^18",
      "@types/react-dom": "^18",
      autoprefixer: "^10.4.19",
      eslint: "^8",
      "eslint-config-next": "14.2.3",
      postcss: "^8",
      tailwindcss: "^3.4.1",
      typescript: "^5",
    },
  };

  const fileContent = JSON.stringify(packageJsonTemplate, null, 2);
  const filePath = path.join(targetDir, "package.json");

  await fs.writeFile(filePath, fileContent);
  logger.trace(
    `[Generator] Archivo package.json escrito exitosamente en: ${filePath}`
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_actions/_generators/generatePackageJson.ts
