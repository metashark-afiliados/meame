// RUTA: src/app/[locale]/page.tsx
/**
 * @file page.tsx
 * @description Homepage del portal. Actúa como un "Server Shell" de élite,
 *              un guardián de datos que asegura la integridad del contenido
 *              antes de delegar al "Client Core".
 * @version 8.0.0 (Data Guardian & Elite Error Handling)
 * @author L.I.A. Legacy - Asistente de Refactorización
 */
import React from "react";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { SectionAnimator } from "@/components/layout/SectionAnimator";
import { SocialProofLogos, CommunitySection } from "@/components/sections";
import { HomePageClient } from "./HomePageClient";

interface HomePageProps {
  params: { locale: Locale };
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  logger.info(`[HomePage Shell] Renderizando v8.0 para locale: ${locale}`);

  try {
    const { dictionary, error: dictError } = await getDictionary(locale);

    // --- [INICIO DE REFACTORIZACIÓN: GUARDIÁN DE CONTRATO] ---
    // Verificamos explícitamente que todas las claves necesarias para el renderizado
    // del cliente y los componentes del servidor estén presentes.
    const { socialProofLogos, heroNews, newsGrid, communitySection } =
      dictionary;
    if (
      dictError ||
      !socialProofLogos ||
      !heroNews ||
      !newsGrid ||
      !communitySection
    ) {
      const missingKeys = [
        !socialProofLogos && "socialProofLogos",
        !heroNews && "heroNews",
        !newsGrid && "newsGrid",
        !communitySection && "communitySection",
      ]
        .filter(Boolean)
        .join(", ");

      throw new Error(
        `Faltan datos de i18n esenciales para el Homepage. Claves ausentes: ${missingKeys}`
      );
    }
    // A partir de aquí, TypeScript sabe que 'dictionary' es un 'Dictionary' completo.
    const fullDictionary = dictionary as Dictionary;
    // --- [FIN DE REFACTORIZACIÓN: GUARDIÁN DE CONTRATO] ---

    return (
      <SectionAnimator>
        <SocialProofLogos content={socialProofLogos} />
        {/* El "Client Core" recibe el diccionario completo para la lógica del lado del cliente */}
        <HomePageClient locale={locale} dictionary={fullDictionary} />
        {/* La CommunitySection, que puede ser un Server Component, se renderiza aquí */}
        <CommunitySection content={communitySection} />
      </SectionAnimator>
    );
  } catch (error) {
    const errorMessage =
      "Fallo crítico al renderizar el Server Shell del Homepage.";
    logger.error(`[HomePage Shell] ${errorMessage}`, { error });

    // --- [INICIO DE REFACTORIZACIÓN: MANEJO DE ERRORES DE ÉLITE] ---
    // Se verifica el tipo de la variable 'error' antes de pasarla.
    const errorDetails = error instanceof Error ? error : String(error);
    return (
      <DeveloperErrorDisplay
        context="HomePage Server Shell"
        errorMessage={errorMessage}
        errorDetails={errorDetails}
      />
    );
    // --- [FIN DE REFACTORIZACIÓN: MANEJO DE ERRORES DE ÉLITE] ---
  }
}
