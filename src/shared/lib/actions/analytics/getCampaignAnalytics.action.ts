// RUTA: shared/lib/actions/analytics/getCampaignAnalytics.action.ts
/**
 * @file getCampaignAnalytics.action.ts
 * @description Server Action para obtener los datos de analíticas de las campañas.
 * @version 1.1.0 (Code Hygiene)
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { logger } from "@/shared/lib/logging";
import type { ActionResult } from "@/shared/lib/types/actions.types";
import type { CampaignAnalyticsData } from "@/shared/lib/schemas/analytics/campaign-analytics.schema";

// Datos mockeados de alta calidad para un desarrollo de UI realista.
const MOCK_ANALYTICS: CampaignAnalyticsData[] = [
  {
    campaignId: "CAMP001",
    variantId: "VAR001",
    variantName: "Oferta Verano 2025",
    summary: {
      totalVisitors: 12530,
      averageTimeOnPage: 125,
      bounceRate: 45.2,
      conversions: 876,
    },
    trafficSources: [
      { source: "Google", visitors: 7800 },
      { source: "Facebook", visitors: 3200 },
      { source: "Directo", visitors: 1530 },
    ],
    visitorsOverTime: [
      { date: "2025-09-01", visitors: 1200 },
      { date: "2025-09-02", visitors: 1500 },
    ],
  },
  {
    campaignId: "CAMP001",
    variantId: "VAR002",
    variantName: "Test B - Descuento 15%",
    summary: {
      totalVisitors: 9870,
      averageTimeOnPage: 145,
      bounceRate: 38.1,
      conversions: 950,
    },
    trafficSources: [
      { source: "Google", visitors: 6500 },
      { source: "Instagram", visitors: 2100 },
      { source: "Directo", visitors: 1270 },
    ],
    visitorsOverTime: [
      { date: "2025-09-01", visitors: 950 },
      { date: "2025-09-02", visitors: 1100 },
    ],
  },
];

export async function getCampaignAnalyticsAction(): Promise<
  ActionResult<CampaignAnalyticsData[]>
> {
  logger.info("[Action] Solicitando datos de analíticas de campañas...");

  try {
    // Simular latencia de red
    await new Promise((resolve) => setTimeout(resolve, 1000));

    logger.success(
      `Se recuperaron ${MOCK_ANALYTICS.length} registros de analíticas (mock).`
    );
    return { success: true, data: MOCK_ANALYTICS };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("Fallo crítico durante la obtención de analíticas.", {
      error: errorMessage,
    });
    return {
      success: false,
      error: "No se pudieron cargar los datos de analíticas.",
    };
  }
}
// RUTA: shared/lib/actions/analytics/getCampaignAnalytics.action.ts
