// RUTA: src/shared/lib/schemas/account/account-forms.schema.ts
/**
 * @file account-forms.schema.ts
 * @description SSoT para los contratos de datos de los formularios de gestión de cuenta.
 * @version 2.0.0 (Elite Type Export Compliance)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";

export const UpdateProfileSchema = z.object({
  fullName: z
    .string()
    .min(3, "El nombre completo debe tener al menos 3 caracteres."),
});

// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
// Se exporta explícitamente el tipo inferido desde el schema.
export type UpdateProfileFormData = z.infer<typeof UpdateProfileSchema>;
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---

export const UpdatePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });
// RUTA: src/shared/lib/schemas/account/account-forms.schema.ts
