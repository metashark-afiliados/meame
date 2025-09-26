// RUTA: src/app/[locale]/(dev)/test-page/page.tsx
/**
 * @file page.tsx
 * @description Página de servidor para la Vitrina de Resiliencia.
 *              v11.0.0 (Server Shell Pattern): Refactorizado para actuar como
 *              un "Server Shell" que carga todos los datos y componentes del
 *              servidor, y los pasa de forma segura al cliente.
 * @version 11.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import TestPageClient from "./_components/TestPageClient.tsx";
import * as Sections from "@/components/sections";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

// --- [INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
// Mapeo de componentes y sus claves de diccionario. Esta lógica ahora
// reside en el servidor, donde debe estar.
const sectionsToRender = [
  { name: "BenefitsSection", Comp: Sections.BenefitsSection, contentKey: "benefitsSection" },
  { name: "CommunitySection", Comp: Sections.CommunitySection, contentKey: "communitySection" },
  // ... Añadir aquí el resto de los componentes de sección ...
  { name: "Hero", Comp: Sections.Hero, contentKey: "hero" },
  { name: "FaqAccordion", Comp: Sections.FaqAccordion, contentKey: "faqAccordion" },
];
// --- [FIN DE REFACTORIZACIÓN ARQUITECTÓNICA] ---

interface DevTestPageProps {
  params: { locale: Locale };
}

export default async function DevTestPage({ params: { locale } }: DevTestPageProps) {
  logger.info("[TestPage Shell] Renderizando v11.0 (Server Shell).");

  try {
    const { dictionary, error } = await getDictionary(locale);
    if (error) throw error;

    const pageContent = dictionary.devTestPage;
    if (!pageContent) throw new Error("Contenido 'devTestPage' no encontrado.");

    // --- [INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
    // Renderizamos todos los componentes de sección aquí, en el servidor.
    const renderedSections = await Promise.all(
      sectionsToRender.map(async ({ name, Comp, contentKey }) => {
        const content = dictionary[contentKey as keyof Dictionary];
        return {
          name,
          // @ts-expect-error Las props de 'content' son dinámicas, lo manejamos.
          jsx: <Comp content={content} locale={locale} />,
        };
      })
    );
    // --- [FIN DE REFACTORIZACIÓN ARQUITECTÓNICA] ---

    return (
      <TestPageClient
        content={pageContent}
        renderedSections={renderedSections}
      />
    );
  } catch (error) {
    const errorMessage = "Fallo crítico al cargar datos para la Vitrina de Componentes.";
    logger.error(`[TestPage Shell] ${errorMessage}`, { error });
    return (
      <DeveloperErrorDisplay
        context="DevTestPage Shell"
        errorMessage={errorMessage}
        errorDetails={error instanceof Error ? error : String(error)}
      />
    );
  }
}
