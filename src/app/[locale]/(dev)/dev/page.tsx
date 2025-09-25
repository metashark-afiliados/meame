// RUTA: src/app/[locale]/(dev)/dev/page.tsx
/**
 * @file page.tsx
 * @description Página principal del Developer Command Center (DCC), que actúa como
 *              un portal a las herramientas de desarrollo de élite.
 * @version 5.0.0 (Holistic Path, Type & Hygiene Correction)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { routes } from "@/shared/lib/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { DeveloperErrorDisplay } from "@/components/dev";
import {
  Container,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  DynamicIcon,
} from "@/components/ui";
import { type LucideIconName } from "@/shared/lib/config/lucide-icon-names";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

interface DevTool {
  key: keyof NonNullable<NonNullable<Dictionary["devDashboardPage"]>["tools"]>;
  href: string;
  icon: LucideIconName;
}

interface DevDashboardPageProps {
  params: { locale: Locale };
}

export default async function DevDashboardPage({
  params: { locale },
}: DevDashboardPageProps) {
  logger.info(`[DevDashboardPage] Renderizando v5.0 para locale: ${locale}`);

  const { dictionary, error } = await getDictionary(locale);
  const content = dictionary.devDashboardPage;

  if (error || !content) {
    const errorMessage = "Fallo al cargar el contenido i18n para el DCC.";
    logger.error(`[DevDashboardPage] ${errorMessage}`, { error });
    if (process.env.NODE_ENV === "production") return notFound();
    return (
      <DeveloperErrorDisplay
        context="DevDashboardPage"
        errorMessage={errorMessage}
        errorDetails={
          error || "La clave 'devDashboardPage' falta en el diccionario."
        }
      />
    );
  }

  const tools: DevTool[] = [
    {
      key: "campaignDesignSuite",
      // --- [INICIO DE CORRECCIÓN DE RUTA] ---
      // Se utiliza la clave correcta del objeto `routes`. La ruta ahora apunta
      // a la página del creador, no al antiguo dev/campaign-suite.
      href: routes.creatorCampaignSuiteByStepId.path({ locale }),
      // --- [FIN DE CORRECCIÓN DE RUTA] ---
      icon: "LayoutTemplate",
    },
    {
      key: "bavi",
      href: routes.bavi.path({ locale }),
      icon: "LibraryBig",
    },
    {
      key: "razPrompts",
      href: routes.razPrompts.path({ locale }),
      icon: "BrainCircuit",
    },
    {
      key: "resilienceShowcase",
      href: routes.devTestPage.path({ locale }),
      icon: "ShieldCheck",
    },
  ];

  return (
    <>
      <PageHeader content={content.pageHeader} />
      <Container className="py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            // --- [INICIO DE CORRECCIÓN DE TIPO] ---
            // Se convierte explícitamente a String para satisfacer el contrato de la prop 'key'.
            <Link href={tool.href} key={String(tool.key)} className="group">
              // --- [FIN DE CORRECCIÓN DE TIPO] ---
              <Card className="h-full transition-all duration-300 group-hover:border-primary group-hover:shadow-lg group-hover:-translate-y-1">
                <CardHeader className="flex-row items-center gap-4">
                  <DynamicIcon
                    name={tool.icon}
                    className="h-8 w-8 text-primary"
                  />
                  <div>
                    <CardTitle>{content.tools[tool.key].name}</CardTitle>
                    <CardDescription className="mt-1">
                      {content.tools[tool.key].description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
