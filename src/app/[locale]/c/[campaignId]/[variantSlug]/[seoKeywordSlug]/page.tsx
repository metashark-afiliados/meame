// app/[locale]/c/[campaignId]/[variantSlug]/[seoKeywordSlug]/page.tsx
/**
 * @file page.tsx
 * @description SSoT para el renderizado de páginas de campaña.
 * @version 4.0.0 (Focus-Aware Contract Sync)
 * @author RaZ Podestá - MetaShark Tech
 */
import * as React from "react";
import { notFound } from "next/navigation";
import {
  getCampaignData,
  resolveCampaignVariant,
} from "@/shared/lib/i18n/campaign.i18n";
import { CampaignThemeProvider } from "@/components/layout/CampaignThemeProvider";
import { SectionRenderer } from "@/components/layout/SectionRenderer";
import { logger } from "@/shared/lib/logging";
import type { Locale } from "@/shared/lib/i18n/i18n.config";

interface CampaignPageProps {
  params: {
    locale: Locale;
    campaignId: string;
    variantSlug: string;
    seoKeywordSlug: string;
  };
}

export async function generateMetadata({ params }: CampaignPageProps) {
  try {
    const { variant } = await resolveCampaignVariant(
      params.campaignId,
      params.variantSlug,
      true
    );
    return {
      title: `${variant.name} | Campaña ${params.campaignId}`,
      description: variant.description,
    };
  } catch (error) {
    logger.error(
      `[generateMetadata] No se pudo resolver la variante para generar metadatos.`,
      { params, error }
    );
    return { title: `Campaña ${params.campaignId}` };
  }
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { locale, campaignId, variantSlug } = params;
  logger.info(
    `[CampaignPage] Renderizando para Campaña: ${campaignId}, Variante: ${variantSlug}, Locale: ${locale}`
  );

  try {
    const { variantId, variant } = await resolveCampaignVariant(
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
      logger.error(
        `[CampaignPage] Fallo de renderizado: El tema para la variante "${variant.name}" no contiene una definición de layout válida.`
      );
      return notFound();
    }

    return (
      <CampaignThemeProvider theme={theme}>
        <SectionRenderer
          sections={theme.layout.sections}
          dictionary={dictionary}
          locale={locale}
        />
      </CampaignThemeProvider>
    );
  } catch (error) {
    logger.error(
      `[CampaignPage] Error crítico al renderizar la página de campaña.`,
      { params, error }
    );
    return notFound();
  }
}
// app/[locale]/c/[campaignId]/[variantSlug]/[seoKeywordSlug]/page.tsx
