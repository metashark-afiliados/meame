// RUTA: src/app/[locale]/(dev)/dev/_components/DevDashboardClient.tsx
/**
 * @file DevDashboardClient.tsx
 * @description Componente de Cliente puro para el DCC. Orquesta la UI y la MEA/UX,
 *              recibiendo todos sus datos desde su Server Component padre.
 * @version 1.1.0 (Icon SSoT Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Container,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  DynamicIcon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Button,
  TiltCard,
} from "@/components/ui";
import { type LucideIconName } from "@/shared/lib/config/lucide-icon-names";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { routes } from "@/shared/lib/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionAnimator } from "@/components/layout/SectionAnimator";
import { type Locale } from "@/shared/lib/i18n/i18n.config";

interface DevTool {
  key: keyof NonNullable<NonNullable<Dictionary["devDashboardPage"]>["tools"]>;
  href: string;
  icon: LucideIconName;
}

interface DevDashboardClientProps {
  content: NonNullable<Dictionary["devDashboardPage"]>;
  locale: Locale;
}

export function DevDashboardClient({
  content,
  locale,
}: DevDashboardClientProps) {
  const tools: DevTool[] = [
    {
      key: "campaignDesignSuite",
      href: routes.creatorCampaignSuite.path({ locale }),
      icon: "LayoutTemplate",
    },
    { key: "bavi", href: routes.bavi.path({ locale }), icon: "LibraryBig" },
    {
      key: "razPrompts",
      href: routes.razPrompts.path({ locale }),
      icon: "BrainCircuit",
    },
    {
      key: "cogniRead",
      href: routes.cogniReadDashboard.path({ locale }),
      icon: "BookOpenCheck",
    },
    { key: "nos3", href: routes.nos3Dashboard.path({ locale }), icon: "Video" },
    {
      key: "aether",
      href: routes.devCinematicDemo.path({ locale }),
      icon: "Film",
    },
    {
      key: "analytics",
      href: routes.analytics.path({ locale }),
      icon: "LineChart",
    },
    {
      key: "resilienceShowcase",
      href: routes.devTestPage.path({ locale }),
      icon: "ShieldCheck",
    },
  ];

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <SectionAnimator>
      <PageHeader content={content.pageHeader} />
      <Container className="py-12">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          initial="hidden"
          animate="visible"
        >
          {tools.map((tool) => (
            <motion.div
              key={tool.key}
              variants={cardVariants}
              className="h-full"
            >
              <TiltCard className="h-full">
                <Card className="h-full transition-all duration-300 border-2 border-transparent hover:border-primary hover:shadow-2xl hover:shadow-primary/20">
                  <Link href={tool.href} className="flex flex-col h-full">
                    <CardHeader className="flex-row items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <DynamicIcon
                          name={tool.icon}
                          className="h-8 w-8 text-primary"
                        />
                      </div>
                      <div className="flex-1">
                        <CardTitle>{content.tools[tool.key].name}</CardTitle>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <DynamicIcon
                                name="CircleHelp"
                                className="h-4 w-4"
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="end"
                            className="max-w-xs"
                          >
                            <p>{content.tools[tool.key].description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardHeader>
                    <CardDescription className="px-6 pb-6 flex-grow">
                      {content.tools[tool.key].description}
                    </CardDescription>
                  </Link>
                </Card>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </SectionAnimator>
  );
}
