// RUTA: src/app/[locale]/(dev)/raz-prompts/page.tsx
/**
 * @file page.tsx
 * @description Página principal de élite para la Bóveda de RaZPrompts.
 *              v9.0.0 (Resilience Restoration): Implementa un manejo de errores
 *              holístico para capturar fallos propagados desde los layouts y
 *              mostrarlos en el DeveloperErrorDisplay, cumpliendo con el pilar
 *              de resiliencia del proyecto.
 * @version 9.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Container,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import { DeveloperErrorDisplay } from "@/components/dev";
import { SectionAnimator } from "@/components/layout/SectionAnimator";
import { PromptCreator } from "@/components/features/raz-prompts/_components/PromptCreator";
import { PromptVault } from "@/components/features/raz-prompts/_components/PromptVault";

interface RaZPromptsHomePageProps {
  params: { locale: Locale };
}

export default async function RaZPromptsHomePage({
  params: { locale },
}: RaZPromptsHomePageProps) {
  logger.info(
    "[RaZPromptsHomePage] Renderizando v9.0 (Resilience Restoration)."
  );

  // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
  // Se envuelve toda la lógica de obtención de datos en un bloque try...catch.
  try {
    const { dictionary, error } = await getDictionary(locale);

    const pageContent = dictionary.razPromptsHomePage;
    const promptCreatorContent = dictionary.promptCreator;
    const promptVaultContent = dictionary.promptVault;

    if (error || !pageContent || !promptCreatorContent || !promptVaultContent) {
      // Este error específico es para cuando falta el contenido i18n.
      throw new Error(
        "Faltan una o más claves de i18n (razPromptsHomePage, promptCreator, promptVault) en el diccionario."
      );
    }

    return (
      <>
        <SectionAnimator>
          <PageHeader content={pageContent} />
          <Container className="py-12">
            <Tabs defaultValue="vault">
              <TabsList className="grid w-full grid-cols-2 md:w-[400px] mb-8">
                <TabsTrigger value="create">
                  {pageContent.createPromptTab}
                </TabsTrigger>
                <TabsTrigger value="vault">
                  {pageContent.viewVaultTab}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="create">
                <PromptCreator content={promptCreatorContent} />
              </TabsContent>
              <TabsContent value="vault">
                <PromptVault
                  content={promptCreatorContent}
                  vaultContent={promptVaultContent}
                />
              </TabsContent>
            </Tabs>
          </Container>
        </SectionAnimator>
      </>
    );
  } catch (error) {
    // Este bloque ahora capturará CUALQUIER error, incluyendo los que vienen
    // de los layouts hijos como el Header.
    const errorMessage =
      "Fallo crítico durante el renderizado de la página RaZPrompts o sus componentes de layout.";
    logger.error(`[RaZPromptsHomePage] ${errorMessage}`, { error });

    // En desarrollo, mostramos el error detallado. En producción, esto debería
    // llevar a una página de error 500.
    if (process.env.NODE_ENV === "development") {
      return (
        <DeveloperErrorDisplay
          context="RaZPromptsHomePage"
          errorMessage={errorMessage}
          errorDetails={error instanceof Error ? error : String(error)}
        />
      );
    }
    // Lógica para producción (ej. redirigir a una página de error genérica)
    return <p>Error 500 - Internal Server Error</p>;
  }
  // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---
}
