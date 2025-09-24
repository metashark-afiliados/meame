// lib/schemas/theming/assembled-theme.schema.ts
/**
 * @file assembled-theme.schema.ts
 * @description SSoT para el contrato de datos de un objeto de tema final y ensamblado.
 * @version 3.2.0 (Strict Layout Contract): Hace que la propiedad 'name' de
 *              la sección sea requerida, resolviendo el error de tipo TS2322.
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { logger } from "@/shared/lib/logging";
import { ColorsFragmentSchema } from "./fragments/colors.schema";
import { FontsFragmentSchema } from "./fragments/fonts.schema";
import { GeometryFragmentSchema } from "./fragments/geometry.schema";

logger.trace(
  "[Schema] Definiendo el contrato para el tema ensamblado final (v3.2 - Strict Layout)..."
);

// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
const LayoutSchema = z
  .object({
    // La propiedad `name` ahora es explícitamente un string requerido.
    sections: z.array(z.object({ name: z.string() })),
  })
  .optional();
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---

export const AssembledThemeSchema = z
  .object({
    ...ColorsFragmentSchema.shape,
    ...FontsFragmentSchema.shape,
    ...GeometryFragmentSchema.shape,
    layout: LayoutSchema,
  })
  .deepPartial();

export type AssembledTheme = z.infer<typeof AssembledThemeSchema>;
// lib/schemas/theming/assembled-theme.schema.ts
