// RUTA: src/shared/lib/schemas/pages/dev-dashboard.schema.ts
/**
 * @file dev-dashboard.schema.ts
 * @description SSoT para el contrato de datos del DCC Dashboard v2.0.
 *              Ahora incluye contratos para todas las herramientas del ecosistema.
 * @version 2.0.0
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
    cogniRead: DevToolSchema,
    nos3: DevToolSchema,
    aether: DevToolSchema,
    analytics: DevToolSchema,
    resilienceShowcase: DevToolSchema,
  }),
});

export const DevDashboardLocaleSchema = z.object({
  devDashboardPage: DevDashboardContentSchema.optional(),
});
