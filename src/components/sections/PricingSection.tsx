// components/sections/PricingSection.tsx
/**
 * @file PricingSection.tsx
 * @description Componente de sección para mostrar planes de precios con animación de élite.
 * @version 2.0.0 (Elite Leveling, MEA/UX Injection & Logic Optimization)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import { Container } from "@/components/ui/Container";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui";
import { logger } from "@/shared/lib/logging";
import { cn } from "@/shared/lib/utils/cn";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { PricingPlan } from "@/shared/lib/schemas/components/pricing-section.schema";

interface PricingSectionProps {
  content?: Dictionary["pricingSection"];
  locale: string;
}

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function PricingSection({
  content,
  locale,
}: PricingSectionProps): React.ReactElement | null {
  logger.info("[PricingSection] Renderizando v2.0 (Elite & MEA).");

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: content?.currency || "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }, [locale, content?.currency]);

  if (!content) {
    logger.warn(
      "[PricingSection] No se proporcionó contenido. La sección no se renderizará."
    );
    return null;
  }

  const { eyebrow, title, subtitle, plans } = content;

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            {eyebrow}
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {title}
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3"
        >
          {plans.map((plan: PricingPlan) => (
            <motion.div key={plan.title} variants={cardVariants}>
              <Card
                className={cn(
                  "flex flex-col h-full rounded-3xl p-8 ring-1 ring-muted-foreground/20 xl:p-10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                  {
                    "bg-muted/30 ring-2 ring-primary": plan.isPopular,
                  }
                )}
              >
                <CardHeader className="p-0">
                  <CardTitle className="text-lg leading-8 text-foreground">
                    {plan.title}
                  </CardTitle>
                  <CardDescription className="mt-4 text-sm leading-6 text-muted-foreground">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex flex-col flex-1 mt-6">
                  <p className="flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-foreground">
                      {currencyFormatter.format(plan.price)}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-muted-foreground">
                      {plan.priceSuffix}
                    </span>
                  </p>
                  <ul className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                    {plan.benefitList.map((benefit) => (
                      <li key={benefit} className="flex gap-x-3">
                        <DynamicIcon
                          name="Check"
                          className="h-6 w-5 flex-none text-primary"
                          aria-hidden="true"
                        />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-auto w-full"
                    variant={plan.isPopular ? "default" : "secondary"}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
// components/sections/PricingSection.tsx
