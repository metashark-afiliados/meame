// RUTA: src/app/[locale]/(dev)/raz-prompts/page.tsx
/**
 * @file page.tsx
 * @description Página principal de élite para la Bóveda de RaZPrompts.
 *              v9.1.0 (Diagnostic Trace Injection): Se inyecta logging de
 *              diagnóstico para trazar el flujo de renderizado del servidor.
 * @version 9.1.0
 * @author L.I.A. Legacy
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
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { SectionAnimator } from "@/components/layout/SectionAnimator";
import { PromptCreator } from "@/components/features/raz-prompts/_components/PromptCreator";
import { PromptVault } from "@/components/features/raz-prompts/_components/PromptVault";

interface RaZPromptsHomePageProps {
  params: { locale: Locale };
}

export default async function RaZPromptsHomePage({
  params: { locale },
}: RaZPromptsHomePageProps) {
  // [INYECCIÓN DE LOGGING]
  const traceId = logger.startTrace("RaZPromptsHomePage_Render");
  logger.info(
    "[RaZPromptsHomePage] Iniciando renderizado de Server Component (v9.1).",
    { locale, traceId }
  );

  try {
    const { dictionary, error } = await getDictionary(locale);
    // [INYECCIÓN DE LOGGING]
    logger.traceEvent(traceId, "Diccionario i18n cargado.", {
      hasError: !!error,
    });

    const pageContent = dictionary.razPromptsHomePage;
    const promptCreatorContent = dictionary.promptCreator;
    const promptVaultContent = dictionary.promptVault;

    if (error || !pageContent || !promptCreatorContent || !promptVaultContent) {
      throw new Error(
        "Faltan una o más claves de i18n (razPromptsHomePage, promptCreator, promptVault)."
      );
    }

    // [INYECCIÓN DE LOGGING]
    logger.traceEvent(traceId, "Contenido i18n validado. Renderizando UI...");

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
                {/* [INYECCIÓN DE LOGGING] Se pasa el traceId al componente hijo */}
                <PromptVault
                  content={promptCreatorContent}
                  vaultContent={promptVaultContent}
                  traceId={traceId}
                />
              </TabsContent>
            </Tabs>
          </Container>
        </SectionAnimator>
      </>
    );
  } catch (error) {
    const errorMessage =
      "Fallo crítico durante el renderizado de la página RaZPrompts.";
    // [INYECCIÓN DE LOGGING]
    logger.error(`[RaZPromptsHomePage] ${errorMessage}`, { error, traceId });
    logger.endTrace(traceId, { error: errorMessage });
    return (
      <DeveloperErrorDisplay
        context="RaZPromptsHomePage"
        errorMessage={errorMessage}
        errorDetails={error instanceof Error ? error : String(error)}
      />
    );
  }
}
