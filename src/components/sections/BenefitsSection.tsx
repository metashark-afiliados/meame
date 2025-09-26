// RUTA: src/components/sections/BenefitsSection.tsx
/**
 * @file BenefitsSection.tsx
 * @description Componente de presentación para la sección de Beneficios.
 * @version 7.0.0 (Pure & Decoupled)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Container,
  DynamicIcon,
} from "@/components/ui";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { BenefitItem } from "@/shared/lib/schemas/components/benefits-section.schema";

type BenefitsSectionContent = NonNullable<Dictionary["benefitsSection"]>;

interface BenefitsSectionProps {
  content: BenefitsSectionContent;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function BenefitsSection({
  content,
}: BenefitsSectionProps): React.ReactElement {
  logger.info("[BenefitsSection] Renderizando v7.0 (Pure & Decoupled).");

  const { eyebrow, title, subtitle, benefits } = content;

  return (
    <motion.section
      variants={sectionVariants}
      id="benefits"
      className="py-24 sm:py-32"
      aria-labelledby="benefits-title"
    >
      <Container>
        <div className="grid lg:grid-cols-2 place-items-center lg:gap-24">
          <div>
            <h2 className="text-lg text-primary mb-2 tracking-wider">
              {eyebrow}
            </h2>
            <h3
              id="benefits-title"
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              {title}
            </h3>
            <p className="text-xl text-muted-foreground mb-8">{subtitle}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 w-full">
            {benefits.map((benefit: BenefitItem, index: number) => (
              <Card
                key={benefit.title}
                className="bg-muted/50 dark:bg-card hover:bg-background transition-all delay-75 group/number"
              >
                <CardHeader>
                  <div className="flex justify-between">
                    <DynamicIcon
                      name={benefit.icon}
                      size={32}
                      className="mb-6 text-primary"
                    />
                    <span className="text-5xl text-muted-foreground/15 font-medium transition-all delay-75 group-hover/number:text-muted-foreground/30">
                      0{index + 1}
                    </span>
                  </div>
                  <CardTitle>{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  {benefit.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </motion.section>
  );
}
