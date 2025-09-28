// RUTA: src/shared/lib/schemas/theme-preset.schema.ts
/**
 * @file theme-preset.schema.ts
 * @description SSoT para la entidad ThemePreset.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { ThemeConfigSchema } from "./campaigns/draft.parts.schema";

export const ThemePresetSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  theme_config: ThemeConfigSchema, // Reutilizamos el contrato del draft
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type ThemePreset = z.infer<typeof ThemePresetSchema>;
