// Ruta correcta: src/shared/lib/schemas/components/auth/user-nav.schema.ts
/**
 * @file user-nav.schema.ts
 * @description SSoT para el contrato de datos del contenido i18n del componente UserNav.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";

export const UserNavContentSchema = z.object({
  loginButton: z.string(),
  sessionLabel: z.string(),
  logoutButton: z.string(),
  viewAllNotificationsLink: z.string(),
  notificationsLabel: z.string(),
  noNotificationsText: z.string(),
  loadingText: z.string(),
});

export const UserNavLocaleSchema = z.object({
  userNav: UserNavContentSchema.optional(),
});
// Ruta correcta: src/shared/lib/schemas/components/auth/user-nav.schema.ts
