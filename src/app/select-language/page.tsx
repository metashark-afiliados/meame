// Ruta correcta: src/app/select-language/page.tsx
/**
 * @file page.tsx
 * @description Página de selección de idioma. Orquesta la carga de contenido
 *              multilingüe y lo pasa al componente de cliente.
 * @version 2.0.0 (Holistic Elite Leveling)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { promises as fs } from "fs";
import path from "path";
import { logger } from "@/shared/lib/logging";
import { LanguageSelectorClient } from "./_components/LanguageSelectorClient";
import { SelectLanguagePageContentSchema } from "@/shared/lib/schemas/pages/select-language.schema";
import { DeveloperErrorDisplay } from "@/components/dev";

async function getSelectLanguageContent() {
  const filePath = path.join(
    process.cwd(),
    "src",
    "messages",
    "pages",
    "select-language.i18n.json"
  );
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const jsonData = JSON.parse(fileContent);
    return SelectLanguagePageContentSchema.parse(jsonData);
  } catch (error) {
    logger.error(
      "[SelectLanguagePage] Fallo crítico al cargar o validar el contenido i18n.",
      { error }
    );
    return null;
  }
}

export default async function SelectLanguagePage() {
  logger.info(
    "[SelectLanguagePage] Renderizando página de selección de idioma v2.0."
  );

  const content = await getSelectLanguageContent();

  if (!content) {
    return (
      <DeveloperErrorDisplay
        context="SelectLanguagePage"
        errorMessage="No se pudo cargar el contenido de la página de selección de idioma."
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <LanguageSelectorClient content={content} />
    </div>
  );
}
// Ruta correcta: src/app/select-language/page.tsx
