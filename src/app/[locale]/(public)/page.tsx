// RUTA: src/app/[locale]/(public)/page.tsx
/**
 * @file page.tsx
 * @description Homepage del portal, ahora en su ubicación arquitectónica correcta y con la ruta de importación nivelada.
 * @version 12.0.0 (Architectural Alignment Fix)
 *@author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { SectionAnimator } from "@/components/layout/SectionAnimator";
import {
  SocialProofLogos,
  CommunitySection,
  ScrollingBanner,
} from "@/components/sections";
import { HomePageClient } from "../HomePageClient"; // <-- RUTA CORREGIDA

interface HomePageProps {
  params: { locale: Locale };
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  const traceId = logger.startTrace("HomePage_Render_v12.0");
  logger.startGroup(
    `[HomePage Shell] Renderizando v12.0 para locale: ${locale}`
  );

  try {
    const { dictionary, error: dictError } = await getDictionary(locale);

    const {
      socialProofLogos,
      heroNews,
      newsGrid,
      communitySection,
      scrollingBanner,
    } = dictionary;

    if (
      dictError ||
      !socialProofLogos ||
      !heroNews ||
      !newsGrid ||
      !communitySection ||
      !scrollingBanner
    ) {
      const missingKeys = [
        !socialProofLogos && "socialProofLogos",
        !heroNews && "heroNews",
        !newsGrid && "newsGrid",
        !communitySection && "communitySection",
        !scrollingBanner && "scrollingBanner",
      ]
        .filter(Boolean)
        .join(", ");

      const errorMessage = `Faltan datos de i18n esenciales para el Homepage. Claves ausentes: ${missingKeys}`;
      logger.error(`[Guardián de Resiliencia] ${errorMessage}`, {
        dictError,
        traceId,
      });
      throw new Error(errorMessage);
    }

    const fullDictionary = dictionary as Dictionary;
    logger.traceEvent(traceId, "Datos i18n obtenidos y validados.");

    return (
      <SectionAnimator>
        <ScrollingBanner content={scrollingBanner} />
        <SocialProofLogos content={socialProofLogos} />
        <HomePageClient locale={locale} dictionary={fullDictionary} />
        <CommunitySection content={communitySection} />
      </SectionAnimator>
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(`[HomePage Shell] ${errorMessage}`, { error: error, traceId });
    return (
      <DeveloperErrorDisplay
        context="HomePage Server Shell"
        errorMessage="Fallo crítico al renderizar el Server Shell del Homepage."
        errorDetails={error instanceof Error ? error : errorMessage}
      />
    );
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}
