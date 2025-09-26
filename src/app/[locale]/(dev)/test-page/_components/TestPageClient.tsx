// RUTA: app/[locale]/(dev)/dev/test-page/_components/TestPageClient.tsx
/**
 * @file TestPageClient.tsx
 * @description Vitrina de Resiliencia de Componentes (Cliente).
 *              v26.1.0 (Code Hygiene): Elimina variables de estado no utilizadas
 *              para cumplir con las reglas de linting y mejorar la claridad del código,
 *              restaurando la integridad del build.
 * @version 26.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useMemo, ComponentType } from "react";
import { motion } from "framer-motion";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { AvailableTheme } from "@/shared/lib/types/test-page/themes.types"; // CORREGIDO
import { PageHeader } from "@/components/layout/PageHeader";
import { CampaignThemeProvider } from "@/components/layout/CampaignThemeProvider";
import {
  Container,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import * as Sections from "@/components/sections";
import { type AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/"; // CORREGIDO

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponentType = ComponentType<any>;

interface SectionToRender {
  name: string;
  Comp: AnyComponentType;
  contentKey: keyof Dictionary;
}

interface TestPageClientProps {
  masterDictionary: Dictionary;
  availableThemes: AvailableTheme[];
  locale: Locale;
}

export default function TestPageClient({
  masterDictionary,
  availableThemes,
  locale,
}: TestPageClientProps) {
  logger.info("[TestPageClient] Renderizando v26.1 (Code Hygiene).");

  // --- [INICIO DE CORRECCIÓN DE HIGIENE] ---
  // Se elimina la función `setSelectedThemeId` que no se estaba utilizando.
  // La capacidad de cambiar de tema se deja pendiente para una futura implementación.
  const [selectedThemeId] = useState<string>("default");
  // --- [FIN DE CORRECCIÓN DE HIGIENE] ---

  const { portalComponents, campaignComponents } = useMemo(() => {
    const allComponents: SectionToRender[] = [
      {
        name: "BenefitsSection",
        Comp: Sections.BenefitsSection,
        contentKey: "benefitsSection",
      },
      {
        name: "CommunitySection",
        Comp: Sections.CommunitySection,
        contentKey: "communitySection",
      },
      {
        name: "ContactSection",
        Comp: Sections.ContactSection,
        contentKey: "contactSection",
      },
      {
        name: "DoubleScrollingBanner",
        Comp: Sections.DoubleScrollingBanner,
        contentKey: "doubleScrollingBanner",
      },
      {
        name: "FaqAccordion",
        Comp: Sections.FaqAccordion,
        contentKey: "faqAccordion",
      },
      {
        name: "FeaturedArticlesCarousel",
        Comp: Sections.FeaturedArticlesCarousel,
        contentKey: "featuredArticlesCarousel",
      },
      {
        name: "FeaturesSection",
        Comp: Sections.FeaturesSection,
        contentKey: "featuresSection",
      },
      {
        name: "GuaranteeSection",
        Comp: Sections.GuaranteeSection,
        contentKey: "guaranteeSection",
      },
      { name: "Hero", Comp: Sections.Hero, contentKey: "hero" },
      { name: "HeroNews", Comp: Sections.HeroNews, contentKey: "heroNews" },
      {
        name: "IngredientAnalysis",
        Comp: Sections.IngredientAnalysis,
        contentKey: "ingredientAnalysis",
      },
      { name: "NewsGrid", Comp: Sections.NewsGrid, contentKey: "newsGrid" },
      {
        name: "OrderSection",
        Comp: Sections.OrderSection,
        contentKey: "orderSection",
      },
      {
        name: "PricingSection",
        Comp: Sections.PricingSection,
        contentKey: "pricingSection",
      },
      {
        name: "ProductShowcase",
        Comp: Sections.ProductShowcase,
        contentKey: "productShowcase",
      },
      {
        name: "ServicesSection",
        Comp: Sections.ServicesSection,
        contentKey: "servicesSection",
      },
      {
        name: "SocialProofLogos",
        Comp: Sections.SocialProofLogos,
        contentKey: "socialProofLogos",
      },
      {
        name: "SponsorsSection",
        Comp: Sections.SponsorsSection,
        contentKey: "sponsorsSection",
      },
      {
        name: "TeamSection",
        Comp: Sections.TeamSection,
        contentKey: "teamSection",
      },
      {
        name: "TestimonialCarouselSection",
        Comp: Sections.TestimonialCarouselSection,
        contentKey: "testimonialCarouselSection",
      },
      {
        name: "TestimonialGrid",
        Comp: Sections.TestimonialGrid,
        contentKey: "testimonialGrid",
      },
      {
        name: "TextSection",
        Comp: Sections.TextSection,
        contentKey: "aboutPage",
      },
      {
        name: "ThumbnailCarousel",
        Comp: Sections.ThumbnailCarousel,
        contentKey: "thumbnailCarousel",
      },
    ];

    const isCampaignKey = (key: keyof Dictionary): boolean => {
      const keyString = String(key);
      return (
        keyString.startsWith("benefits") ||
        keyString.startsWith("hero") ||
        keyString.startsWith("order")
      );
    };

    return {
      portalComponents: allComponents.filter(
        (c) => !isCampaignKey(c.contentKey)
      ),
      campaignComponents: allComponents.filter((c) =>
        isCampaignKey(c.contentKey)
      ),
    };
  }, []);

  const pageContent = masterDictionary.devTestPage;
  const pageHeaderContent = masterDictionary.pageHeader;

  const defaultThemeObject: AssembledTheme = useMemo(
    () => ({
      layout: { sections: [] },
      colors: {},
      fonts: { sans: "var(--font-sans)", serif: "var(--font-serif)" },
      geometry: { "--radius": "0.5rem" },
    }),
    []
  );

  const currentThemeData = useMemo(() => {
    if (selectedThemeId === "default") return defaultThemeObject;
    return (
      availableThemes.find((t) => t.id === selectedThemeId)?.themeData ??
      defaultThemeObject
    );
  }, [selectedThemeId, availableThemes, defaultThemeObject]);

  if (!pageContent || !pageHeaderContent) {
    return (
      <DeveloperErrorDisplay
        context="TestPageClient"
        errorMessage="Contenido 'devTestPage' o 'pageHeader' no encontrado en el diccionario."
      />
    );
  }

  const renderComponentList = (components: SectionToRender[]) => (
    <motion.div
      className="space-y-8"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
      }}
      initial="hidden"
      animate="visible"
    >
      {components.map(({ name, Comp, contentKey }) => {
        const content = masterDictionary[contentKey];
        let renderOutput;
        if (!content) {
          renderOutput = (
            <div className="p-4 text-yellow-500 border border-yellow-500 rounded-md bg-yellow-500/10">
              <strong>⚠️ Advertencia:</strong>
              <p className="text-xs">
                Contenido para '{String(contentKey)}' no encontrado en el
                diccionario.
              </p>
            </div>
          );
        } else {
          try {
            renderOutput = <Comp content={content} locale={locale} />;
          } catch (error) {
            renderOutput = (
              <div className="p-4 text-destructive border border-destructive rounded-md bg-destructive/10">
                <strong>❌ Error al renderizar:</strong>
                <pre className="text-xs whitespace-pre-wrap mt-2">
                  {error instanceof Error ? error.message : String(error)}
                </pre>
              </div>
            );
          }
        }
        return (
          <motion.div
            key={name}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-accent">{name}</CardTitle>
              </CardHeader>
              <CardContent>{renderOutput}</CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );

  return (
    <CampaignThemeProvider theme={currentThemeData}>
      <PageHeader content={pageHeaderContent} />
      <Container className="my-8">
        <Tabs defaultValue="campaign">
          <TabsList className="grid w-full grid-cols-2 md:w-[500px] mb-8 mx-auto">
            <TabsTrigger value="campaign">Componentes de Campaña</TabsTrigger>
            <TabsTrigger value="portal">
              Componentes del Portal/Globales
            </TabsTrigger>
          </TabsList>
          <TabsContent value="campaign">
            {renderComponentList(campaignComponents)}
          </TabsContent>
          <TabsContent value="portal">
            {renderComponentList(portalComponents)}
          </TabsContent>
        </Tabs>
      </Container>
    </CampaignThemeProvider>
  );
}
