// RUTA: app/[locale]/analytics/page.tsx
/**
 * @file page.tsx
 * @description Página principal para el Dashboard de Analíticas.
 * @version 2.0.0 (KPI Charts Integration)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { getCampaignAnalyticsAction } from "@/shared/lib/actions/analytics/getCampaignAnalytics.action";
import { DashboardHeader } from "@/components/features/analytics/DashboardHeader";
import { CampaignsTable } from "@/components/features/analytics/CampaignsTable";
import { KPICharts } from "@/components/features/analytics/KPICharts"; // Importamos el nuevo componente
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { DynamicIcon } from "@/components/ui";

export default async function AnalyticsPage(): Promise<React.ReactElement> {
  const analyticsResult = await getCampaignAnalyticsAction();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <DashboardHeader />

      {analyticsResult.success ? (
        <>
          {/* --- [INICIO DE INTEGRACIÓN] --- */}
          <KPICharts data={analyticsResult.data} />
          {/* --- [FIN DE INTEGRACIÓN] --- */}

          <CampaignsTable data={analyticsResult.data} />
        </>
      ) : (
        <Alert variant="destructive">
          <DynamicIcon name="AlertTriangle" className="h-4 w-4" />
          <AlertTitle>Error al Cargar Datos</AlertTitle>
          <AlertDescription>{analyticsResult.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
