// RUTA: app/[locale]/(dev)/raz-prompts/page.tsx
/**
 * @file page.tsx
 * @description Página principal de élite para la Bóveda de RaZPrompts.
 * @version 8.0.0 (FSD Architecture Alignment)
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
import { PromptCreator, PromptVault } from "./_components";
import { notFound } from "next/navigation";

interface RaZPromptsHomePageProps {
  params: { locale: Locale };
}

export default async function RaZPromptsHomePage({
  params: { locale },
}: RaZPromptsHomePageProps) {
  logger.info("[RaZPromptsHomePage] Renderizando v8.0 (FSD Aligned).");

  const { dictionary, error } = await getDictionary(locale);

  const pageContent = dictionary.razPromptsHomePage;
  const promptCreatorContent = dictionary.promptCreator;
  const promptVaultContent = dictionary.promptVault;

  if (error || !pageContent || !promptCreatorContent || !promptVaultContent) {
    const errorMessage =
      "Fallo al cargar el contenido i18n para la página principal de RaZPrompts.";
    logger.error(`[RaZPromptsHomePage] ${errorMessage}`, { error });
    if (process.env.NODE_ENV === "production") {
      return notFound();
    }
    return (
      <DeveloperErrorDisplay
        context="RaZPromptsHomePage"
        errorMessage={errorMessage}
        errorDetails={
          error ||
          "Una o más claves (razPromptsHomePage, promptCreator, promptVault) faltan en el diccionario."
        }
      />
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
}
