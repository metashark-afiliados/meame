// RUTA: shared/lib/schemas/pages/dev-login-page.schema.ts
/**
 * @file dev-login-page.schema.ts
 * @description SSoT para el contrato de datos i18n del nuevo login del DCC
 *              basado en Supabase.
 * @version 3.0.0
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
});

export const DevLoginPageLocaleSchema = z.object({
  devLoginPage: DevLoginPageContentSchema.optional(),
});
