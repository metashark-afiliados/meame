// RUTA: src/app/[locale]/page.tsx
/**
 * @file page.tsx
 * @description Homepage del portal, ahora con un "Guardián de Resiliencia Verboso" de élite.
 * @version 11.1.0 (Verbose Resilience Guardian Pattern)
 * @author L.I.A. Legacy
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
import { HomePageClient } from "./HomePageClient";

interface HomePageProps {
  params: { locale: Locale };
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  const traceId = logger.startTrace("HomePage_Render_v11.1");
  logger.startGroup(
    `[HomePage Shell] Renderizando v11.1 para locale: ${locale}`
  );

  try {
    const { dictionary, error: dictError } = await getDictionary(locale);

    // --- [INICIO DEL PATRÓN "GUARDIÁN VERBOSO"] ---
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

      // 1. REGISTRAR EL ERROR CONTEXTUAL ANTES DE FALLAR
      logger.error(`[Guardián de Resiliencia] ${errorMessage}`, {
        dictError,
        traceId,
      });

      // 2. LANZAR EL ERROR PARA DETENER EL RENDERIZADO
      throw new Error(errorMessage);
    }
    // --- [FIN DEL PATRÓN "GUARDIÁN VERBOSO"] ---

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
    // Este bloque catch ahora capturará tanto errores de red como nuestros errores lanzados por el guardián.
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
