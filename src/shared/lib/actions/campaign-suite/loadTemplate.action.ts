// app/[locale]/(dev)/dev/campaign-suite/_actions/loadTemplate.action.ts
/**
 * @file loadTemplate.action.ts
 * @description Server Action para cargar los datos de una plantilla específica.
 * @version 2.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { promises as fs } from "fs";
import path from "path";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import {
  CampaignTemplateSchema,
  type CampaignTemplate,
} from "@/shared/lib/schemas/templates/template.schema";
import { logger } from "@/shared/lib/logging";

export async function loadTemplateAction(
  templateId: string
): Promise<ActionResult<CampaignTemplate>> {
  try {
    const templatePath = path.join(
      process.cwd(),
      `content/templates/${templateId}.json`
    );
    const file = await fs.readFile(templatePath, "utf-8");
    const template = CampaignTemplateSchema.parse(JSON.parse(file));
    return { success: true, data: template };
  } catch (error) {
    logger.error("No se pudo cargar la plantilla seleccionada.", { error });
    return {
      success: false,
      error: "La plantilla seleccionada no se pudo cargar o es inválida.",
    };
  }
}
