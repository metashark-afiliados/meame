// RUTA: src/shared/lib/schemas/pages/dev-login-page.schema.ts
/**
 * @file dev-login-page.schema.ts
 * @description SSoT para el contrato de datos i18n del dominio de login del DCC.
 * @version 5.0.0 (Forgot Password & Last Sign-In UI Content)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";

export const DevLoginPageContentSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  emailLabel: z.string(),
  emailPlaceholder: z.string(),
  passwordLabel: z.string(),
  passwordPlaceholder: z.string(),
  forgotPasswordLink: z.string(),
  buttonText: z.string(),
  buttonLoadingText: z.string(),
  signUpPrompt: z.string(),
  signUpLink: z.string(),
  footerHtml: z.string(),
  backgroundImageAssetId: z
    .string()
    .min(1, "Se requiere un assetId para la imagen de fondo."),
  // --- [INICIO DE NUEVOS CONTRATOS] ---
  forgotPassword: z.object({
    modalTitle: z.string(),
    modalDescription: z.string(),
    submitButton: z.string(),
    submitButtonLoading: z.string(),
    cancelButton: z.string(),
    successToastTitle: z.string(),
    successToastDescription: z.string(),
  }),
  lastSignIn: z.object({
    title: z.string(),
    location: z.string().includes("{{location}}"),
    ip: z.string().includes("{{ip}}"),
  }),
  // --- [FIN DE NUEVOS CONTRATOS] ---
});

export const DevLoginPageLocaleSchema = z.object({
  devLoginPage: DevLoginPageContentSchema.optional(),
});
