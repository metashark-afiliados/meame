// RUTA: src/components/features/campaign-suite/TemplateBrowser/_components/TemplateCard.tsx
/**
 * @file TemplateCard.tsx
 * @description Componente de presentación atómico para una tarjeta de plantilla.
 * @version 2.0.0 (MEA/UX Injection)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui";
import { TiltCard } from "@/components/ui/TiltCard";
import type { CampaignTemplate } from "@/shared/lib/schemas/campaigns/template.schema";

interface TemplateCardProps {
  template: CampaignTemplate;
  onSelect: () => void;
  isPending: boolean;
}

export function TemplateCard({
  template,
  onSelect,
  isPending,
}: TemplateCardProps) {
  const formattedDate = new Date(template.created_at).toLocaleDateString();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <TiltCard className="h-full">
        <Card className="h-full flex flex-col transition-all duration-300 ease-in-out hover:border-primary hover:shadow-2xl hover:shadow-primary/20">
          <CardHeader>
            <CardTitle>{template.name}</CardTitle>
            <CardDescription>
              {template.description || "Sin descripción."}
            </CardDescription>
          </CardHeader>
          <div className="flex-grow p-6 pt-0 text-sm text-muted-foreground">
            Creada: {formattedDate}
          </div>
          <CardFooter>
            <Button onClick={onSelect} disabled={isPending} className="w-full">
              {isPending ? (
                <DynamicIcon
                  name="LoaderCircle"
                  className="mr-2 h-4 w-4 animate-spin"
                />
              ) : (
                <DynamicIcon name="Wand" className="mr-2 h-4 w-4" />
              )}
              Usar esta Plantilla
            </Button>
          </CardFooter>
        </Card>
      </TiltCard>
    </motion.div>
  );
}
