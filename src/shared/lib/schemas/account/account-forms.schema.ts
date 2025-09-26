// RUTA: src/shared/lib/schemas/account/account-forms.schema.ts
/**
 * @file account-forms.schema.ts
 * @description SSoT para los contratos de datos de TODOS los formularios de la página de cuenta.
 * @version 2.0.0 (Holistic Refactor & Password Schema Integration)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";

// --- [INICIO DE REFACTORIZACIÓN SOBERANA] ---

// Schema para el formulario de actualización de perfil
export const UpdateProfileSchema = z.object({
  fullName: z
    .string()
    .min(3, "El nombre completo debe tener al menos 3 caracteres."),
});
export type UpdateProfileFormData = z.infer<typeof UpdateProfileSchema>;

// Schema para el formulario de cambio de contraseña
export const UpdatePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"], // Asocia el error al campo de confirmación
  });
export type UpdatePasswordFormData = z.infer<typeof UpdatePasswordSchema>;

// --- [FIN DE REFACTORIZACIÓN SOBERANA] ---

// Se mantiene el schema de contenido i18n para el ProfileForm aquí por cohesión
export const ProfileFormContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  emailLabel: z.string(),
  fullNameLabel: z.string(),
  saveButtonText: z.string(),
  successToast: z.string(),
  errorToastTitle: z.string(),
});

export const ProfileFormLocaleSchema = z.object({
  profileForm: ProfileFormContentSchema.optional(),
});
