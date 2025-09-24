// RUTA: shared/lib/schemas/pages/dev-dashboard.schema.ts
/**
 * @file dev-dashboard.schema.ts
 * @description SSoT para el contrato de datos del DCC Dashboard.
 * @version 5.0.0 (Atomic Composition & Elite Compliance)
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";
import { PageHeaderContentSchema } from "../components/page-header.schema";

const DevToolSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const DevDashboardContentSchema = z.object({
  pageHeader: PageHeaderContentSchema,
  tools: z.object({
    campaignDesignSuite: DevToolSchema,
    bavi: DevToolSchema,
    razPrompts: DevToolSchema,
    resilienceShowcase: DevToolSchema,
  }),
  // La propiedad 'suiteStyleComposer' ha sido eliminada. Su contrato
  // ahora es gestionado por su propio schema soberano y ensamblado
  // en el i18n.schema.ts maestro.
});

export const DevDashboardLocaleSchema = z.object({
  devDashboardPage: DevDashboardContentSchema.optional(),
});
