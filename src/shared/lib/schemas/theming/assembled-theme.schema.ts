// RUTA: src/shared/lib/schemas/theming/assembled-theme.schema.ts
/**
 * @file assembled-theme.schema.ts
 * @description SSoT para el contrato de datos de un objeto de tema final y ensamblado.
 * @version 4.0.0 (Strict Layout Contract & Surgical Partial)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { logger } from "@/shared/lib/logging";
import { ColorsFragmentSchema } from "./fragments/colors.schema";
import { FontsFragmentSchema } from "./fragments/fonts.schema";
import { GeometryFragmentSchema } from "./fragments/geometry.schema";

logger.trace(
  "[Schema] Definiendo el contrato para el tema ensamblado final (v4.0)..."
);

const LayoutSchema = z
  .object({
    sections: z.array(z.object({ name: z.string() })),
  })
  .optional();

// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE] ---
// Se aplica .deepPartial() solo a los fragmentos de estilo, pero se mantiene
// el contrato de LayoutSchema estricto, resolviendo el error de tipo TS2322.
export const AssembledThemeSchema = z
  .object({
    ...ColorsFragmentSchema.shape,
    ...FontsFragmentSchema.shape,
    ...GeometryFragmentSchema.shape,
  })
  .deepPartial()
  .extend({
    layout: LayoutSchema,
  });
// --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

export type AssembledTheme = z.infer<typeof AssembledThemeSchema>;
