// RUTA: src/app/[locale]/c/[campaignId]/[variantSlug]/[seoKeywordSlug]/page.tsx
/**
 * @file page.tsx
 * @description SSoT para el renderizado de páginas de campaña, ahora con tracking de Aura.
 * @version 5.0.0 (Aura Tracking Integration)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { notFound } from "next/navigation";
import {
  getCampaignData,
  resolveCampaignVariant,
} from "@/shared/lib/i18n/campaign.i18n";
import { CampaignThemeProvider } from "@/components/layout/CampaignThemeProvider";
import { SectionRenderer } from "@/components/layout/SectionRenderer";
import { AuraTrackerInitializer } from "@/components/features/analytics/AuraTrackerInitializer"; // <-- IMPORTACIÓN
import { logger } from "@/shared/lib/logging";
import type { Locale } from "@/shared/lib/i18n/i18n.config";

// ... (generateMetadata sin cambios)

export default async function CampaignPage({
  params,
}: {
  params: {
    locale: Locale;
    campaignId: string;
    variantSlug: string;
    seoKeywordSlug: string;
  };
}) {
  const { locale, campaignId, variantSlug } = params;

  try {
    const { variantId } = await resolveCampaignVariant(
      campaignId,
      variantSlug,
      true
    );
    const { dictionary, theme } = await getCampaignData(
      campaignId,
      locale,
      variantId
    );

    if (!theme.layout?.sections || theme.layout.sections.length === 0) {
      return notFound();
    }

    return (
      <CampaignThemeProvider theme={theme}>
        {/* === INICIO DE INTEGRACIÓN DE AURA === */}
        <AuraTrackerInitializer
          scope="visitor"
          campaignId={campaignId}
          variantId={variantId}
        />
        {/* === FIN DE INTEGRACIÓN DE AURA === */}
        <SectionRenderer
          sections={theme.layout.sections}
          dictionary={dictionary}
          locale={locale}
        />
      </CampaignThemeProvider>
    );
  } catch (error) {
    logger.error(`[CampaignPage] Error crítico al renderizar.`, {
      params,
      error,
    });
    return notFound();
  }
}
