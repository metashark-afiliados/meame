// components/forms/builder/SchemaFieldRenderer/_hooks/useFieldMetadata.ts
/**
 * @file useFieldMetadata.ts
 * @description Hook puro para interpretar las "pistas" de UI desde un schema de Zod.
 * @version 1.2.0 (Syntax Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
import { useMemo } from "react";
import { z } from "zod";
import { logger } from "@/shared/lib/logging";
import type { FieldMetadata } from "../_types/field.types";

/**
 * @function useFieldMetadata
 * @description Un hook que toma un schema de Zod y extrae metadatos para renderizar la UI.
 * @param fieldSchema El schema de Zod para un campo específico.
 * @param fieldName El nombre del campo.
 * @returns {FieldMetadata} Un objeto con los metadatos de UI.
 */
export function useFieldMetadata(
  fieldSchema: z.ZodTypeAny,
  fieldName: string
): FieldMetadata {
  // --- [INICIO DE CORRECCIÓN DE SINTAXIS] ---
  logger.trace(`[useFieldMetadata] Interpretando schema para: ${fieldName}`);
  // --- [FIN DE CORRECCIÓN DE SINTAXIS] ---

  return useMemo(() => {
    const description = fieldSchema.description || "";
    const hints = new Map<string, string>();
    description.split("|").forEach((part) => {
      const [key, ...valueParts] = part.split(":");
      if (key && valueParts.length > 0) {
        hints.set(key.trim(), valueParts.join(":").trim());
      }
    });

    const typeName = fieldSchema._def.typeName;
    let controlType: FieldMetadata["controlType"] = "input";

    if (hints.get("ui:control") as FieldMetadata["controlType"]) {
      controlType = hints.get("ui:control") as FieldMetadata["controlType"];
    } else if (typeName === "ZodBoolean") {
      controlType = "switch";
    } else if (typeName === "ZodEnum") {
      controlType = "select";
    } else if (
      typeName === "ZodString" &&
      (description.includes("image_url") ||
        description.includes("image_asset_id"))
    ) {
      controlType = "image";
    }

    return {
      label:
        hints.get("ui:label") ||
        fieldName
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
      placeholder: hints.get("ui:placeholder"),
      description: hints.get("ui:description"),
      controlType,
    };
  }, [fieldSchema, fieldName]);
}
// components/forms/builder/SchemaFieldRenderer/_hooks/useFieldMetadata.ts
